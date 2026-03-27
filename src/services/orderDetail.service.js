import prisma from "../libs/prismaClient.js";
import createError from "http-errors";

export async function getOrderDetails() {
  const result = await prisma.orderDetail.findMany();
  return result;
}