import prisma from "../libs/prismaClient.js";

export async function createLocation(data) {
  const result = await prisma.location.create({
    data
  });

  return result;
}

export async function getLocationById(id) {
  const result = await prisma.location.findUnique({
     where: { id },
  });

  return result;
}