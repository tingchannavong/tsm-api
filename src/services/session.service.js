import prisma from "../libs/prismaClient.js";

export async function createSessions(payload) {
  const {
    name1 = "Guest 1",
    locationId = undefined,
    groupId = undefined,
    people = undefined,
    pricingId = undefined,
  } = payload;

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
      locationId: locationId,
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
      locationId: sessionData.locationId, 
      groupId: sessionData.groupId,
      pricingId: sessionData.pricingId,
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

export async function getAllSessions(filters) {
  if (!filters) {
    return await prisma.sessionRecord.findMany();
  }
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

export async function updateSessionById(id, data) {
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
