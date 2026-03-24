import prisma from "../libs/prismaClient.js";

export async function createSession(data) {
  const result = await prisma.sessionRecord.create({
    data,
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
    where: filters
  });

  return result;
}

export async function getSessionById(id) {
    return await prisma.sessionRecord.findUnique({
        where: {id}
    });
}

export async function updateSessionById(id, data) {
    return await prisma.sessionRecord.update({
        where: {id},
        data
    });
}

export async function deleteSessionById(id) {
    return await prisma.sessionRecord.delete({
        where: {id}
    });
}