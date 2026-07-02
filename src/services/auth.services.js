import prisma from "../libs/prismaClient.js";
import { generateToken, verifyUserToken } from "../utils/jwt.js";
import createError from "http-errors";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  updateUserById,
  USER_FIELDS,
} from "./user.service.js";
import { compareStrings, hashString } from "../utils/crypt.js";
import { havePermissionToEdit, sanitizeData } from "../utils/core.js";
import transporter from "../utils/mailer.js";

export async function createRegisterInviteLink(currentUser, payload) {
  // check role only ADMIN allow to create this
  if (currentUser.role !== "ADMIN") {
    throw createError(403, "Invalid permission");
  }

  const { email } = payload;

  // call jwt function to create token
  const jwtPayload = { email };
  const inviteToken = generateToken(jwtPayload, process.env.INVITE_KEY, "1d");

  // create reset link that front-end requires
  const inviteLink = process.env.CLIENT_BASE_URL + `/register-invite/${inviteToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "TSM Create New User Request",
    html: `<p>Click <a href="${inviteLink}">here</a> to create user in TSM. The link expires in 1 day.</p>`
  }
  
  try {
    // send reset link to email
    await transporter.sendMail(mailOptions);
    console.log('invitation email sent');
  } catch (error) {
    throw createError(500, "Error sending email to user.")
  }

  return { inviteLink, 
    inviteToken };
}

export async function userRegisterByInviteLink(inviteToken, payload) {
  // check that invite token exists in db

  const registrationData = sanitizeData(payload, USER_FIELDS);

  const user = await createUser(registrationData);
  // so user can log in straight away
  const token = generateToken(user);

  return {
    user,
    token
  };
}

export async function adminRegisterUser(currentUser, payload) {
  // check role only ADMIN allow to add
  if (currentUser.role !== "ADMIN") {
    throw createError(403, "Invalid permission");
  }

  const registrationData = sanitizeData(payload, USER_FIELDS);

  const user = await createUser(registrationData);

  // const token = generateToken(user);

  return {
    user,
    // token
  };
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
      email: user.email,
    },
  };
}

export async function logOut(refreshToken) {
  // console.log("refreshToken", refreshToken);
  if (!refreshToken) throw createError(400, "No refresh token.");
  await prisma.token.delete({
    where: {
      token: refreshToken,
    },
  });
}

// REFRESH TOKEN SAVE TO DB
export async function createRefreshTokenRecord(user, refreshTokenData, decode, tx = prisma) {
  const { refreshToken, ipAddress, userAgent } = refreshTokenData;
  const res = await tx.token.create({
    data: {
      userId: user.id,
      token: refreshToken,
      type: "REFRESH",
      expiresAt: new Date(decode.exp * 1000),
      ipAddress,
      userAgent,
    },
  });
  return res;
}

export async function manageRefreshToken(
  oldRefreshToken,
  ipAddress,
  userAgent,
) {
  if (!oldRefreshToken) {
    throw createError(401, "No refresh token provided");
  }

  console.log('oldRefreshToken', oldRefreshToken)
  return await prisma.$transaction(async (tx) => {
    // 1. Find the token
    const savedToken = await tx.token.findUnique({
      where: { token: oldRefreshToken },
    });

    if (!savedToken) throw createError(401, "No saved token");

    // 2. Check expiry
    if (savedToken.expiresAt < new Date()) {
      await tx.token.delete({ where: { token: oldRefreshToken } });
      throw createError(401, "Refresh token expired.");
    }

    // 3. Delete the old one
    await tx.token.delete({ where: { token: oldRefreshToken } });

    // 4. Decode and find user
    const decodeOld = verifyUserToken(oldRefreshToken, process.env.REFRESH_KEY);
    const user = await findUserById(decodeOld.id);
    if (!user) throw createError(400, "Invalid user.");

    // 5. Create new tokens (pass the transaction client 'tx' here)
    // success: proceed
    const res = await createAuthTokens(user, ipAddress, userAgent, tx);

    return {
      access_token: res.access_token,
      refreshToken: res.refreshToken,
      user: { id: user.id, name: user.username, email: user.email },
    };
  });
}

export async function createAuthTokens(user, ipAddress, userAgent, tx = prisma) {
  const { role, username, id } = user;
  const payload = { role, username, id };
  const access_token = generateToken(payload, process.env.SECRET_KEY, "15m");
  const refreshToken = generateToken(payload, process.env.REFRESH_KEY, "14d");
  const decode = verifyUserToken(refreshToken, process.env.REFRESH_KEY);

  const refreshTokenData = {
    ipAddress,
    userAgent,
    refreshToken,
  };

  const res = await createRefreshTokenRecord(user, refreshTokenData, decode, tx);
  if (!res) {
    throw createError(500, "Failed to save refresh token");
  }

  return {
    access_token,
    refreshToken,
  };
}

export async function changeUserPassword(currentUser, id, payload) {
  havePermissionToEdit(currentUser, id);

  const { oldPassword, newPassword } = payload;
  // check old password
  const user = await findUserById(id);

  const isMatch = compareStrings(oldPassword, user.password);

  if (!isMatch) {
    throw createError(400, "Invalid credentials");
  }

  return await updateUserById(id, { password: newPassword });
}

// RESET PASSWORD
export async function createResetPasswordLink(payload) {
  const { email } = payload;

  const user = await findUserByEmail(email);

  if (!user) {
    throw createError(401, "This email is not registered in our system.");
  }
  
  // write to security stamp to user table
  const timeStamp = new Date();
  await updateUserById(user.id, { securityStamp: timeStamp });

  // call jwt function to create token
  const jwtPayload = { id: user.id, securityStamp:  timeStamp};
  const resetToken = generateToken(jwtPayload, process.env.RESET_KEY, "10m");

  // save reset token to db

  // create reset link that front-end requires
  const resetLink = process.env.CLIENT_BASE_URL + `/reset-password/${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "TSM Password Reset Request",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. The link expires in 10 minutes.</p>`
  }
  
  try {
    // send reset link to email
    await transporter.sendMail(mailOptions);
    console.log('reset email sent');
  } catch (error) {
    throw createError(500, "Error sending email to user.")
  }

  return { resetLink, 
    resetToken };
}

export async function resetUserPassword(currentUser, payload) {
  const { newPassword } = payload;
  const { id, securityStamp } = currentUser;
  
  const user = await findUserById(id);
  
  if (!user) {
    throw createError(401, "This user is no longer registered in our system.");
  }
  
  const securityStampString = user.securityStamp.toISOString();
  if (securityStamp !== securityStampString) {
    throw createError(403, "Forbidden: invalid security stamp.");
  }

  return await updateUserById(id, { password: newPassword, securityStamp: new Date() });
}

// SECURITY FOR RESET PASSWORD IN RESET DB
// export async function createResetTokenIdentity(resetToken, userId) {
//   const hash = await hashString(resetToken);
//   const res = await prisma.token.create({
//     data: {
//       token: hash,
//       userId,
//     },
//   });
//   return res;
// }

// export async function findResetTokenByUserId(userId) {
//   const res = await prisma.token.find({
//     where: { userId }
//   });
//   return res;
// }

// export async function compareResetTokenIdentity(resetToken, userId) {
//   const hash = await hashString(resetToken);
//   const res = await prisma.token.create({
//     data: {
//       token: hash,
//       userId,
//     },
//   });
//   return res;
// }

// export async function deleteResetTokenIdentity(resetToken) {
//   const res = await prisma.token.delete({
//     where: { token }
//   });
//   return res;
// }