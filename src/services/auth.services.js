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
import TokenService from "./token.service.js";
import { verifyGoogleToken } from "./google.service.js";

export async function createRegisterInviteLink(currentUser, payload) {
  // check role only ADMIN allow to create this
  if (currentUser.role !== "ADMIN") {
    throw createError(403, "Invalid permission");
  }

  const { email } = payload;

  // save to token db
  const res = await TokenService.issue("INVITE");

  // create reset link that front-end requires
  const inviteLink =
    process.env.CLIENT_BASE_URL + `/register-invite/${res.rawToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "TSM Create New User Request",
    html: `<p>Click <a href="${inviteLink}">here</a> to create user in TSM. The link expires in 3 days.</p>`,
  };

  try {
    // send reset link to email
    await transporter.sendMail(mailOptions);
    console.log("invitation email sent");
  } catch (error) {
    throw createError(500, "Error sending email to user.");
  }

  return { inviteLink, inviteToken: res.rawToken };
}

export async function userRegisterByInviteLink(inviteToken, payload) {
  // check that invite token exists in db
  const record = await TokenService.verify(inviteToken, "INVITE");
  if (!record) throw createError(400, "Invalid or expired invite");

  return await prisma.$transaction(async (tx) => {
    const registrationData = sanitizeData(payload, USER_FIELDS);
    const user = await createUser(registrationData, tx);

    // delete old invite token
    await TokenService.revoke(inviteToken, tx);
    return user;
  });
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

export async function googleAuthService(payload, ipAddress, userAgent) {
  const { idToken } = payload;
  const googlePayload = await verifyGoogleToken(idToken);
  console.log("googlePayload", googlePayload);
  const user = await findUserByEmail(googlePayload.email);
  console.log("user", user);

  if (user.provider === "local") {
    throw createError(400, "User already exists. Please log in via username and password.");
  }

  if (!user) {
    // if user does not exist, create new user
    console.log("we are here");
    const userData = {
      username: googlePayload.name,
      phone: googlePayload.phone,
      email: googlePayload.email,
      firstname: googlePayload.given_name,
      lastname: googlePayload.family_name,
      provider: "google"
    };
    const registrationData = sanitizeData(userData, USER_FIELDS);

    const user = await createUser(registrationData);
  }

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
}

  
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

export async function logOut(userId, refreshToken) {
  // console.log("refreshToken", refreshToken);
  if (!refreshToken) throw createError(400, "No refresh token.");
  await TokenService.revokeAllForUser(userId, "REFRESH");
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

// REFRESH TOKEN SAVE TO DB
export async function manageRefreshToken(
  oldRefreshToken,
  ipAddress,
  userAgent,
) {
  if (!oldRefreshToken) {
    throw createError(401, "No refresh token provided");
  }

  // console.log('oldRefreshToken', oldRefreshToken)
  return await prisma.$transaction(async (tx) => {
    // 1. Find the token
    const record = await TokenService.verify(oldRefreshToken, "REFRESH", tx);
    if (!record) throw createError(401, "No saved refresh token");
    const savedToken = record.result;
    const decodeOld = record.payload;

    // 2. Check expiry
    if (savedToken.expiresAt < new Date()) {
      await TokenService.revoke(oldRefreshToken, tx);
      throw createError(401, "Refresh token expired.");
    }

    // 3. Delete the old one
    await TokenService.revoke(oldRefreshToken, tx);

    // 4. Decode and find user
    const user = await findUserById(decodeOld.userId);
    if (!user) throw createError(400, "Invalid user.");

    // 5. Create new tokens successful: proceed
    const res = await createAuthTokens(user, ipAddress, userAgent, tx);

    return {
      access_token: res.access_token,
      refreshToken: res.refreshToken,
      user: { id: user.id, name: user.username, email: user.email },
    };
  });
}

export async function createAuthTokens(
  user,
  ipAddress,
  userAgent,
  tx = prisma,
) {
  const { role, username, id } = user;
  const payload = { role, username, id };
  const access_token = generateToken(payload, process.env.SECRET_KEY, "15m");

  const refreshTokenData = {
    userId: user.id,
    ipAddress,
    userAgent,
  };

  const res = await TokenService.issue("REFRESH", refreshTokenData, tx);
  if (!res) {
    throw createError(500, "Failed to save refresh token");
  }

  return {
    access_token,
    refreshToken: res.rawToken,
  };
}

// RESET PASSWORD
export async function createResetPasswordLink(payload) {
  const { email } = payload;

  const user = await findUserByEmail(email);
  if (!user)
    throw createError(401, "This email is not registered in our system.");

  // save reset token to db
  await TokenService.revokeAllForUser(user.id, "PASSWORD_RESET");
  await TokenService.revokeAllForUser(user.id, "REFRESH");
  const res = await TokenService.issue("PASSWORD_RESET", {
    userId: user.id,
  });

  // create reset link that front-end requires
  const resetLink =
    process.env.CLIENT_BASE_URL + `/reset-password/${res.rawToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "TSM Password Reset Request",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. The link expires in 10 minutes.</p>`,
  };

  try {
    // send reset link to email
    await transporter.sendMail(mailOptions);
    console.log("reset email sent");
  } catch (error) {
    throw createError(500, "Error sending email to user.");
  }

  return { resetLink, resetToken: res.rawToken };
}

export async function resetUserPassword(resetToken, payload) {
  const { newPassword } = payload;

  return await prisma.$transaction(async (tx) => {
    // Find the token
    const record = await TokenService.verify(resetToken, "PASSWORD_RESET", tx);
    if (!record) throw createError(401, "No saved reset token");
    const savedToken = record.result;
    const decodeOld = record.payload;

    if (savedToken.expiresAt < new Date()) {
      await TokenService.revoke(oldRefreshToken, tx);
      throw createError(401, "Reset token expired.");
    }

    await TokenService.revoke(resetToken, tx);

    const user = await findUserById(decodeOld.userId);
    if (!user)
      throw createError(
        400,
        "This user is no longer registered in our system.",
      );
    return await updateUserById(decodeOld.userId, { password: newPassword });
  });
}
