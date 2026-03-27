import prisma from "../libs/prismaClient.js";
import createError from "http-errors";

export async function createSessions(payload) {
  // TO DO: refactor into names: [array]
  const { name1, locationId, groupId, people, pricingId } = payload;

  const totalPeople = Number(people) || 1;
  const result = [];

  // TO ADD: auto-generate names feature, inclu name1

  // Create first session
  const first = await createSession({
    name: name1,
    locationId,
    groupId,
    pricingId,
  });

  const newGroupId = first.groupId;
  result.push(first);

  // For group, get group id from response, create the rest
  for (let i = 2; i <= totalPeople; i++) {
    const eachName = payload[`name${i}`];

    const session = await createSession({
      name: eachName,
      locationId,
      groupId: newGroupId,
      pricingId,
    });
    result.push(session);
  }

  return result;
}

export async function createSession(sessionData) {
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

export async function getSessionsByLocation(locationId) {
  const result = await prisma.sessionRecord.findMany({
    where: { locationId },
  });

  return result;
}

export async function getAllSessions(payload) {
  const { groupId, locationId, status } = payload;

  const filters = {};
  if (groupId) filters.groupId = groupId;
  if (locationId) filters.locationId = locationId;
  if (status) filters.status = status;

  const result = await prisma.sessionRecord.findMany({
    where: filters,
  });

  return result;
}

export async function getSessionById(id) {
  return await prisma.sessionRecord.findUnique({
    where: { id },
  });
}

export async function getSessionByGroupId(groupId) {
  return await prisma.sessionRecord.findFirst({
    where: { groupId },
    select: { startTime: true, endTime: true },
  });
}

// TO DO: lock session after STATUS ==- BILLED no edits allowed
export async function updateSessionById(id, payload) {
  // TO DO: add updated by who
  const { status, name, startTime, endTime, pricingId } = payload;

  const needsTimeValidation = startTime || endTime;

  if (needsTimeValidation) {
    const currentSession = await getSessionById(id);

    if (!currentSession) throw createError(404, "Session not found");

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

export async function deleteSessionById(id) {
  return await prisma.sessionRecord.delete({
    where: { id },
  });
}

// TO DO: lock session after STATUS ==- BILLED no edits allowed
// LATER: handle other update fields like startTime
// TO DO: add updated by who
export async function updateSessionByGroup(groupId, payload) {
  const { status, endTime } = payload;
  const data = {};
  
  if (status) data.status = status;

  const sampleSession = await getSessionByGroupId(groupId);

  if (!sampleSession) throw createError(404, "Session not found");

  if (endTime) {
    const finalEnd = new Date(endTime);

    if (finalEnd < sampleSession.startTime) {
      throw createError(400, "End time cannot be earlier than start time");
    }
    data.endTime = new Date(endTime);
  }

  if (Object.keys(data).length === 0) {
    throw createError(400, "No valid update fields provided");
  }

  return await prisma.sessionRecord.updateMany({
    where: { groupId },
    data,
  });
}

console.log(new Date("2026-03-24 18:15:00").toISOString());

//  // check end time more than start time logic
//   if (startTime && endTime) {
//     if (endTime < startTime) {
//       throw createError(400, "End time is less than start time");
//     }
//     data.startTime = startTime;
//     data.endTime = endTime;
//   } else if (startTime) {
//     if (currentSession.endTime < startTime) {
//       throw createError(400, "End time is less than start time");
//     }
//     data.startTime = startTime;
//   } else if (endTime) {
//     if (endTime < currentSession.startTime) {
//       throw createError(400, "End time is less than start time");
//     }
//     data.endTime = endTime;
//   }
