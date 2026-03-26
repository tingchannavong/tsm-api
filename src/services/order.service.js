import prisma from "../libs/prismaClient.js";
import createError from "http-errors";

export async function getOrderPreviewBySession(locationId) {
  const result = await prisma.sessionRecord.findMany({
    where: { locationId },
  });

  return result;
}