import prisma from "../libs/prismaClient.js";
import createError from "http-errors";
import { hashString } from "../utils/crypt.js";

export async function createUser(userData) {
  const { username, password, phone, email, firstname, lastname, role } =
    userData;

  const hash = await hashString(password);

  const result = await prisma.user.create({
    data: { username, phone, email, firstname, lastname, password: hash, role },
  });

  return result;
}

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

export async function updatePasswordById(id, newPassword) {
  const hash = await hashString(newPassword);
  const updatePassword = await prisma.user.update({
    where: { id },
    data: { password: hash },
  });
  return updatePassword;
}

export async function updateUserById(id, newPassword) {
  const { status, updatedById } = payload;

  const data = {};
  if (status) data.status = status;
  if (updatedById) data.updatedById = updatedById;

  const hash = await hashString(newPassword);
  const updatePassword = await prisma.user.update({
    where: { id },
    data: { password: hash },
  });
  return updatePassword;
}

export async function getAllUsers(userPayload) {

   // CHECK IF ADMIN CAN VIEW
  if (userPayload.role !== 'ADMIN') throw createError(403, `No permission to view all user data`); 

  const result = await prisma.user.findMany({});

  return result;
}

export async function deleteUserById(id, role) {
  // CHECK IF ADMIN CAN DELETE
  if (role !== 'ADMIN') throw createError(403, `No permission to delete`); 

  const result = await prisma.user.delete({
    where: {id}
  });

  return result;
}

