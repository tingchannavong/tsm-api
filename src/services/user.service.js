import prisma from "../libs/prismaClient.js";
import createError from "http-errors";

export async function getAllUsers() {
  const result = await prisma.user.findMany();

  return result;
}

export async function getUserById(id) {
  const result = await prisma.user.findUnique({
    where: { id }
  });

  return result;
}

export async function deleteUserById(id) {
  const result = await prisma.user.delete({
    where: { id },
  });

  return result;
}