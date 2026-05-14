import prisma from "../libs/prismaClient.js";
import createError from "http-errors";
import { cleanSessionsToGroups } from "../utils/core.js";
import { vaildateAndProvideEndTime } from "../utils/time.js";

export async function createSessions(payload) {
  const { names = ['Guest 1'], locationId, groupId, people, pricingId } = payload;

  const totalPeople = Number(people) || 1;
  const result = [];

  // Create first session
  const first = await createSession({
    name: names[0] ? names[0] : 'Guest 1',
    locationId,
    groupId,
    pricingId,
  });

  const newGroupId = first.groupId;
  result.push(first);

  let indexOfName = 1;
  // For group, get group id from response, create the rest
  for (let i = 2; i <= totalPeople; i++) {
    const eachName = names[indexOfName] ? names[indexOfName] : `Guest ${indexOfName+1}`;

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

export async function getSessionById(id) {
  return await prisma.sessionRecord.findUnique({
    where: { id },
  });
}

// BELOW 2 GET FUNCTIONS CAN COMBINE INTO ONE
export async function getSessionsByFilter(payload) {
    const { groupId, locationId } = payload;

   const filters = {};
  if (groupId) filters.groupId = groupId;
  if (locationId) filters.locationId = locationId;
  filters.status = "ACTIVE";

  const data = await prisma.sessionRecord.findMany({
    where: filters ,
  });

  const result = cleanSessionsToGroups(data)

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
    include: {
      location: {
        select: {name: true}
      }
    }
  });

  return result;
}

export async function getSessionByGroupId(groupId) {
  return await prisma.sessionRecord.findMany({
    where: {groupId: groupId} ,
  });
}

export async function deleteSessionById(id) {

   await validateBilledSession([id]);

  return await prisma.sessionRecord.delete({
    where: { id },
  });
}

// LATER: handle other update fields like startTime
// export async function updateSessionByField(field, info, payload, tx) {
// }

// TO DO: add updated by who
export async function endGroupSessions(field, info, payload, tx) {
  const db = tx || prisma;

  const { status, endTime } = payload;

  // normalize info input
   const arrayedInfo = [];
  if (!Array.isArray(info)) arrayedInfo.push(info);

  const isBilled = await getSessionsWhere({status: 'BILLED', [field]: info});
  if (isBilled.length > 0) throw createError(403, "Cannot create order for already billed session(s)");

  const allSessions = await getSessionByGroupId(info);

  const data = {};
  if (status) data.status = status;

  const finalEnd = vaildateAndProvideEndTime(allSessions, endTime)

  data.endTime = finalEnd;

  if (Object.keys(data).length === 0) {
    throw createError(400, "No valid update fields provided");
  }

  return await db.sessionRecord.updateMany({
    where: { [field]: info },
    data,
  });
}

export async function endIndividualSessions(payload, tx) {
 const { status, endTime, sessionIds } = payload;

  const isBilled = await getSessionsWhere({status: 'BILLED', id: sessionIds});
  if (isBilled.length > 0) throw createError(403, "Cannot create order for already billed session(s)");

  const allSessions = await getSessionsWhere({id: sessionIds});

  const data = {};
  if (status) data.status = status;

  const finalEnd = vaildateAndProvideEndTime(allSessions, endTime)

  data.endTime = finalEnd;

  if (Object.keys(data).length === 0) {
    throw createError(400, "No valid update fields provided");
  }

  return await db.sessionRecord.updateMany({
    where: { id: sessionIds },
    data,
  });
}

export async function updateSessionById(id, payload) {
  // TO DO: add updated by who
  const { status, name, startTime, endTime, pricingId } = payload;

   const currentSession = getSessionById(id);

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

export async function getSessionsWhere(where) {
  return prisma.sessionRecord.findMany({ where });
}

export async function validateBilledSession(sessionIds) {
  const isBilled = await getSessionsWhere({status: 'BILLED', id: {in: sessionIds}});
  if (isBilled.length > 0) throw createError(403, "Cannot create order for already billed session(s)");

  return true;
}

// console.log(new Date("2026-03-24 18:15:00").toISOString());
