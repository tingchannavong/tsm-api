import prisma from "../libs/prismaClient.js";
import createError from "http-errors";
import { hashString } from "../utils/crypt.js";
import { havePermissionToEdit, sanitizeData } from "../utils/core.js";

export const USER_FIELDS = [
   "username",
  "email",
  "firstname",
  "lastname",
  "phone",
  "password",
  "role", 
  "securityStamp"
];

export async function createUser(userData, tx = prisma) {
  const { username, password, phone, email, firstname, lastname, role } =
    userData;

  const hash = await hashString(password);

  const result = await tx.user.create({
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

export async function findUserByEmail(email) {
  const found = await prisma.user.findUnique({ where: { email } });
  return found;
}

export async function allowUpdateUserService(currentUser, id, payload) {
  havePermissionToEdit(currentUser, id, payload.role);
  return await updateUserById(id, payload);
}

export async function updateUserById(id, payload) {
  const { password } = payload;
  const data = sanitizeData(payload, USER_FIELDS);

  if (password) {
      const hash = await hashString(password);
      data.password = hash;
  }

  const updateUserData = await prisma.user.update({
    where: { id },
    data: data
  });
  return updateUserData;
}

export async function getAllUsers(role) {
  // CHECK IF ADMIN CAN VIEW
  if (role !== "ADMIN")
    throw createError(403, `No permission to view this data`);

  const result = await prisma.user.findMany({});

  return result;
}

export async function deleteUserById(id, role) {
  // CHECK IF ADMIN CAN DELETE
  if (role !== "ADMIN") throw createError(403, `No permission to delete`);

  const result = await prisma.user.delete({
    where: { id },
  });

  return result;
}
