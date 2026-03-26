import prisma from "../libs/prismaClient.js";
import createError from "http-errors";

export async function getPricingById(id) {
  const result = await prisma.pricing.findUnique({
    where: { id },
  });

  return result;
}