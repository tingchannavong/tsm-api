import prisma from "../libs/prismaClient.js";
import createError from "http-errors";

export async function findUserById(id) {
  const found = await prisma.user.findUnique({ where: { id } });
  return found;
}

export async function findUserByUsername(username) {
  const found = await prisma.user.findUnique({ where: { username } });
  return found;
}

export async function findUserByPhone(phone) {
  const found = await prisma.user.findUnique({ where: { phone } });
  return found;
}