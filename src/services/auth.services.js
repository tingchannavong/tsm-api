import prisma from "../libs/prismaClient.js";
import { generateToken, verifyUserToken } from "../utils/jwt.js";
import createError from "http-errors";
import { createUser, findUserById, findUserByUsername, updateUserById, USER_FIELDS } from "./user.service.js";
import { compareStrings, hashString } from "../utils/crypt.js";
import { havePermissionToEdit, sanitizeData } from "../utils/core.js";

export async function registerUser(currentUser, payload) {
   // check role only ADMIN allow to add
    if (currentUser.role !== "ADMIN") {
      next(createError(401, "Invalid permission"));
    }

  const registrationData = sanitizeData(payload, USER_FIELDS)
  
  const user = await createUser(registrationData);
  
  // const token = generateToken(user);
  
  return { user, 
    // token 
    };
}

export async function createTokenIdentity(resetToken, userId) {
  const hash = await hashString(resetToken);
  const res = await prisma.token.create({
    data: {
      token: hash,
      userId,
    },
  });
  return res;
}

export async function verifyUserAuth(username, password, ipAddress, userAgent) {
  const user = await findUserByUsername(username);

  if (!user) {
    throw createError(400, "Invalid username or password.");
  }
  const isMatch = await compareStrings(password, user.password);

  if (!isMatch) {
    throw createError(400, "Invalid credentials");
  }

   // Success: proceed
   const res = await createAuthTokens(user, ipAddress, userAgent);
  //  console.log('res at create auth tokens', res)

  return {
    access_token: res.access_token,
    refreshToken: res.refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
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

export async function logOut(refreshToken) {
  console.log('refreshToken', refreshToken)
  if (!refreshToken) throw createError(400, "No refresh token.");
  await prisma.refreshToken.delete({
    where: {
      token: refreshToken
    }
  })
}

export async function manageRefreshToken(oldRefreshToken, ipAddress, userAgent) {
  if (!oldRefreshToken) {
    throw createError(401, "No refresh token provided");
  }

  const savedToken = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken }
  });

  // console.log('savedToken', savedToken)

  if (!savedToken) throw createError(401, "No saved token");

  if(savedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: {
      token: oldRefreshToken
    }})
    throw createError(401, "Refresh token expired.")
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
  // success: proceed
  const res = await createAuthTokens(user, ipAddress, userAgent);
  const newAccessToken = res.access_token;
  const newRefreshToken = res.refreshToken;

  return {
    access_token: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      name: user.username,
      email: user.email
    }
  };
}

export async function createAuthTokens(user, ipAddress, userAgent) {
  const { role, username, id } = user;
  const payload = { role, username, id };
  const access_token = generateToken(payload, process.env.SECRET_KEY, "15m");
  const refreshToken = generateToken(payload, process.env.REFRESH_KEY, "14d");
  const decode = verifyUserToken(refreshToken, process.env.REFRESH_KEY);

  const refreshTokenData = {
    ipAddress,
    userAgent,
    refreshToken
  }

  const res = await createRefreshTokenRecord(user, refreshTokenData, decode);
  if (!res) {
    throw createError(500, "Failed to save refresh token");
  }

  return {
    access_token,
    refreshToken
  };
}

export async function changeUserPassword(currentUser, id, payload) {
  havePermissionToEdit(currentUser, id);

  const {oldPassword, newPassword} = payload;
  // check old password
  const user = await findUserById(id);

  const isMatch = compareStrings(oldPassword, user.password)

  if (!isMatch) {
    throw createError(400, "Invalid credentials");
  }

  return await updateUserById(id, {password: newPassword})


} 