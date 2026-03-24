import bcrypt from "bcrypt";
import prisma from "../libs/prismaClient.js";

async function hashString(string, saltRounds) {
  const hash = await bcrypt.hash(string, saltRounds);
  return hash;
}

export async function createUser(userData) {
  const { username, password, phone, email, firstname, lastname, role } =
    userData;

  const hash = await hashString(password, 10);

  const result = await prisma.user.create({
    data: { username, phone, email, firstname, lastname, password: hash, role },
  });

  return result;
}

export async function updatePasswordById(id, newPassword) {
  const hash = await hashString(newPassword, 10);
  const updatePassword = await prisma.user.update({
    where: { id },
    data: { password: hash },
  });
  return updatePassword;
}

export async function createTokenIdentity(resetToken, userId) {
  const hash = await hashString(resetToken, 3);
  const res = await prisma.token.create({
    data: {
      token: hash,
      userId,
    },
  });
  return res;
}

export async function findUserByUsername(username) {
  const found = await prisma.user.findUnique({ where: { username } });
  return found;
}

export async function findUserById(id) {
  const found = await prisma.user.findUnique({ where: { id } });
  return found;
}

export async function verifyUserAuth(username, password) {
  const user = await findUserByUsername(username);
  if (!user) {
    return null;
  } else {
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? user : false;
  }
}

export async function findUserByPhone(phone) {
  const found = await prisma.user.findUnique({ where: { phone } });
  return found;
}
