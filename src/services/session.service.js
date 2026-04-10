import prisma from "../libs/prismaClient.js";
import createError from "http-errors";
import { cleanSessionsToGroups } from "../utils/core.js";

export async function createSession(sessionData) { // FETCHER
  const result = await prisma.sessionRecord.create({
    data: {
      name: sessionData.name,
      locationId: sessionData.locationId || undefined,
      groupId: sessionData.groupId || undefined,
      pricingId: sessionData.pricingId || undefined,
    },
  });

  return result;
}

export async function getSessionById(id) { // FETCHER
  return await prisma.sessionRecord.findUnique({
    where: { id },
  });
}

export async function updateSessions(whereFilters, data, tx) { // FETCHER
  const db = tx || prisma;
  return await db.sessionRecord.updateMany({
    where: whereFilters,
    data,
  });
}

export async function getSessionsWhere(filters) { // FETCHER
  return prisma.sessionRecord.findMany({
    where: filters,
    include: {
      location: {
        select: { name: true },
      },
    },
  });
}

export async function deleteSession(id) { // FETCHER
  return prisma.sessionRecord.delete({
    where: {id}
  });
}

export async function deleteSessionsWhere(filters, tx) { // FETCHER
    const db = tx || prisma;
  return db.sessionRecord.deleteMany({
    where: filters
  });
}

export async function deleteSessionById(id) { // ORCHESTRATOR
  // NORMALIZE INFO INPUT TO ARRAY
  const arrayedInfo = Array.isArray(id) ? id : [id];
  
  const whereFilters = {
      id: { in: arrayedInfo}
  }
   const sessions = await getSessionsWhere(whereFilters);

  if (sessions.length === 0) {
    throw createError(400, "Not sessions found");
  }

  validateBilledSessions(sessions);
  
  return await deleteSessionById(id);
}

export async function deleteSessions(ids) { // ORCHESTRATOR
  const idArray = Array.isArray(ids) ? ids : [ids];
  const whereFilters = { id: { in: idArray } };

  // Run in a transaction to ensure data integrity
  return await prisma.$transaction(async (tx) => {
    const sessions = await tx.sessionRecord.findMany({
      where: whereFilters,
    });

    if (sessions.length === 0) {
      throw createError(404, "No sessions found to delete");
    }

    if (sessions.length !== idArray.length) {
      throw createError(400, "Some sessions could not be found");
    }

    validateBilledSessions(sessions);

    return await deleteSessions(whereFilters, tx);
  });
}

export async function createSessions(payload) { // ORCHESTRATOR
  const {
    names = ["Guest 1"],
    locationId,
    groupId,
    people,
    pricingId,
  } = payload;

  const totalPeople = Number(people) || 1;
  const result = [];

  // Create first session
  const first = await createSession({
    name: names[0] ? names[0] : "Guest 1",
    locationId,
    groupId,
    pricingId,
  });

  const newGroupId = first.groupId;
  result.push(first);

  let indexOfName = 1;
  // For group, get group id from response, create the rest
  for (let i = 2; i <= totalPeople; i++) {
    const eachName = names[indexOfName]
      ? names[indexOfName]
      : `Guest ${indexOfName + 1}`;

    const session = await createSession({
      name: eachName,
      locationId,
      groupId: newGroupId,
      pricingId,
    });
    result.push(session);
    indexOfName++;
  }

  return result;
}

export async function getSessionsByFilter(payload) { // ORCHESTRATOR
  const { groupId, locationId } = payload;

  const filters = {};
  if (groupId) filters.groupId = groupId;
  if (locationId) filters.locationId = locationId;
  filters.status = "ACTIVE";

  const data = await getSessionsWhere(filters);

  const result = cleanSessionsToGroups(data);

  return result;
}

export async function getAllSessions(payload) { // ORCHESTRATOR
  const { groupId, locationId, status } = payload;

  const filters = {};
  if (groupId) filters.groupId = groupId;
  if (locationId) filters.locationId = locationId;
  if (status) filters.status = status;

  const result = await getSessionsWhere(filters);

  return result;
}

// LATER: handle other update fields like startTime
// TO DO: add updated by who
export async function updateSessionByField(field, info, payload, tx) { // ORCHESTRATOR

  const { status, endTime } = payload;

  const data = {};
  if (status) data.status = status;

  // NORMALIZE INFO INPUT TO ARRAY
  const arrayedInfo = Array.isArray(info) ? info : [info];

  const whereFilters = {
    [field]: { in: arrayedInfo}
  }

  const sessions = await getSessionsWhere(whereFilters);

  if (sessions.length === 0) {
    throw createError(400, "Not sessions found");
  }

  validateBilledSessions(sessions);

  endTime ? data.endTime = new Date(endTime) : data.endTime = new Date();
  
  validateEndTime(data.endTime , sessions);

  if (Object.keys(data).length === 0) {
    throw createError(400, "No valid update fields provided");
  }

  const result = await updateSessions(whereFilters, data, tx);

  return result;
}

export function validateEndTime(finalEndTime, sessions) { // VALIDATOR
  sessions.forEach( eachSession => {
    if (finalEndTime < eachSession.startTime) {
      throw createError(400, "End time cannot be earlier than start time");
    }
  });
}

export function validateBilledSessions(sessions) { // VALIDATOR 
    // loop sessions and check if status is billed
  sessions.forEach( eachSession => {
    if (eachSession.status === 'BILLED') {
      throw createError(403, "Cannot create order for already billed session(s)");
    }
  });
}

export async function updateSessionById(id, payload) { // ORCHESTRATOR
  // TO DO: add updated by who
  const { status, name, startTime, endTime, pricingId } = payload;

  const currentSession = await getSessionById(id);

  if (!currentSession) {
    throw createError(404, "Session not found");
  }

  await validateBilledSession([id]);

  const needsTimeValidation = startTime || endTime;

  if (needsTimeValidation) {
    const finalStart = startTime
      ? new Date(startTime)
      : currentSession.startTime;
    const finalEnd = endTime ? new Date(endTime) : currentSession.endTime;
    if (finalEnd < finalStart) {
      throw createError(400, "End time cannot be earlier than start time");
    }
  }

  const data = {};

  if (status) data.status = status;
  if (name) data.name = name;
  if (startTime) data.startTime = new Date(startTime);
  if (endTime) data.endTime = new Date(endTime);
  if (pricingId) data.pricingId = pricingId;

  if (Object.keys(data).length === 0) {
    throw createError(400, "No valid update fields provided");
  }

  return await prisma.sessionRecord.update({
    where: { id },
    data,
  });
}

export async function validateBilledSession(sessionIds) {
  const isBilled = await getSessionsWhere({
    status: "BILLED",
    id: { in: sessionIds },
  });
  if (isBilled.length > 0)
    throw createError(403, "Cannot create order for already billed session(s)");

  return true;
}

// console.log(new Date("2026-03-24 18:15:00").toISOString());
