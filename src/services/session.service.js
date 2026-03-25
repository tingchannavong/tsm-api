import prisma from "../libs/prismaClient.js";
import createError from "http-errors";

export async function createSessions(payload) {
  // TO DO: refactor into names: [array]
  const { name1 = "Guest 1", locationId, groupId, people, pricingId } = payload;

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
      name: sessionData.name || "Guest",
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

export async function updateSessionById(id, payload) {
  const { status, name, startTime, endTime } = payload;

  const currentSession = await getSessionById(id);

  const data = {};

  if (status) data.status = status;
  if (name) data.name = name;

  // check end time more than start time logic
  if (startTime && endTime) {
    if (endTime < startTime) {
      throw createError(400, "End time is less than start time");
    }
    data.startTime = startTime;
    data.endTime = endTime;
  } else if (startTime) {
    if (currentSession.endTime < startTime) {
      throw createError(400, "End time is less than start time");
    }
    data.startTime = startTime;
  } else if (endTime) {
    if (endTime < currentSession.startTime) {
      throw createError(400, "End time is less than start time");
    }
    data.endTime = endTime;
  }

  // auto calc duration min from db how?

  // return await prisma.sessionRecord.update({
  //   where: { id },
  //   data,
  // });
}

export async function deleteSessionById(id) {
  return await prisma.sessionRecord.delete({
    where: { id },
  });
}
