import prisma from "../libs/prismaClient.js";

export async function createSession(data) {
  const result = await prisma.sessionRecord.create({
    data
  });

  return result;
}