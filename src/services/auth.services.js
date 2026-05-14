import bcrypt from "bcrypt";
import prisma from "../libs/prismaClient.js";
import { generateToken, verifyUserToken } from "../utils/jwt.js";
import createError from "http-errors";

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

export async function verifyUserAuth(username, password, ipAddress, userAgent) {
  const user = await findUserByUsername(username);

  if (!user) {
    throw createError(400, "Invalid username or password.");
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw createError(400, "Invalid credentials");
  }

  // Success: proceed
  const { role, id } = user;
  const payload = { username, role, id };
  const newAccessToken = generateToken(payload, process.env.SECRET_KEY, "15m");
  const newRefreshToken = generateToken(payload, process.env.REFRESH_KEY, "14d");
  const decode = verifyUserToken(newRefreshToken, process.env.REFRESH_KEY);

  const refreshTokenData = {
    ipAddress,
    userAgent,
    refreshToken: newRefreshToken
  }

  // save refresh token as db
  const res = await createRefreshTokenRecord(user, refreshTokenData, decode);

  if (!res) {
    throw createError(500, "Failed to save refresh token");
  }

  return {
    access_token: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
}

export async function findUserByPhone(phone) {
  const found = await prisma.user.findUnique({ where: { phone } });
  return found;
}

// REFRESH TOKEN SAVE TO DB
export async function createRefreshTokenRecord(user, refreshTokenData, decode) {
  const { refreshToken, ipAddress, userAgent} = refreshTokenData;
  const res = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(decode.exp * 1000),
      ipAddress,
      userAgent
    }
  })
  return res;
}

export async function manageRefreshToken(oldRefreshToken, ipAddress, userAgent) {
  console.log('oldRefreshToken', oldRefreshToken);
  if (!oldRefreshToken) {
    throw createError(400, "No refresh token provided");
  }

  const savedToken = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken }
  });

  console.log('savedToken', savedToken)

  if (!savedToken) throw createError(400, "No saved token");

  if(savedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: {
      token: oldRefreshToken
    }})
    throw createError(400, "Refresh token expired.")
  };

  // delete old one anyway
  await prisma.refreshToken.delete({ where: {
      token: oldRefreshToken
    }});
  
  const decodeOld = verifyUserToken(oldRefreshToken, process.env.REFRESH_KEY);

  const user = await findUserById(decodeOld.id);

  if (!user) {
    throw createError(400, "Invalid username or password.");
  }
  const { role, id } = user;
  const payload = { role, id };
  const access_token = generateToken(payload, process.env.SECRET_KEY, "15m");
  const newRefreshToken = generateToken(payload, process.env.REFRESH_KEY, "14d");
  const decode = verifyUserToken(newRefreshToken, process.env.REFRESH_KEY);

  const refreshTokenData = {
    ipAddress,
    userAgent,
    refreshToken: newRefreshToken
  }

  const res = await createRefreshTokenRecord(user, refreshTokenData, decode);
  console.log('res at new req service', res)
  if (!res) {
    throw createError(500, "Failed to save refresh token");
  }

  return {
    access_token,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      name: user.username,
      email: user.email
    }
  };

}
