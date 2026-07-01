import {
  adminRegisterUser,
  changeUserPassword,
  createRegisterInviteLink,
  createResetPasswordLink,
  logOut,
  manageRefreshToken,
  userRegisterByInviteLink,
  resetUserPassword,
  verifyUserAuth,
} from "../services/auth.services.js";
import { generateToken } from "../utils/jwt.js";
import createError from "http-errors";
import "dotenv/config";
import { findUserByPhone } from "../services/user.service.js";

export async function registerController(req, res, next) {
  try {
    const user = await adminRegisterUser(req.userPayload, req.body);
    res.status(201).json({ message: "User added successfully", user });
  } catch (error) {
    next(error);
  }
}

export async function userRegisterController(req, res, next) {
  const { token } = req.params;
  try {
    const user = await userRegisterByInviteLink(token, req.body);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    next(error);
  }
}

export async function registerInvitationController(req, res, next) {
  try {
    const responses = await createRegisterInviteLink(req.userPayload, req.body);
    res.status(201).json({ message: "Register invitation email sent successfully.", responses });
  } catch (error) {
    next(error);
  }
}

export async function loginController(req, res, next) {
  try {
    const { username, password } = req.body;
    // save ipaddress and useragent for refresh token best practice, trackable
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"] || "N/A";

    const user = await verifyUserAuth(username, password, ipAddress, userAgent);
    const access_token = user.access_token;

    // refresh token is sent to front-end as cookie of express
    res.cookie("refreshToken", user.refreshToken, {
      httpOnly: true,
      secure: false,
    });

    res.status(200).json({ message: "Log in success", access_token });
  } catch (error) {
    next(error);
  }
}

export async function refreshTokenController(req, res, next) {
  try {
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"] || "N/A";
    const oldRefreshToken = req.cookies.refreshToken;

    const result = await manageRefreshToken(
      oldRefreshToken,
      ipAddress,
      userAgent,
    );
    const access_token = result.access_token;
    // console.log('result of new refresh token', result)
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
    });

    res.status(200).json({ message: "success refresh", access_token });
  } catch (error) {
    next(error);
  }
}

export async function logOutController(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;

    const result = await logOut(refreshToken);

    res.status(200).json({ message: "Log out success" });
  } catch (error) {
    next(error);
  }
}

export async function changePasswordController(req, res, next) {
  const { id } = req.params;
  const currentUser = {
    id: req.userPayload.id,
    role: req.userPayload.role,
  };

  try {
    // CHANGE PASSWORD SERVICE
    const responses = await changeUserPassword(currentUser, id, req.body);

    res.status(200).json({ message: "Password change successful." });
  } catch (error) {
    next(error);
  }
}

// Later
export async function checkUserController(req, res, next) {
  try {
    // Create reset link SERVICE
    const responses = await createResetPasswordLink(req.body);
    res
      .status(200)
      .json({ message: "Reset password email successfully sent", responses });
  } catch (error) {
    next(error);
  }
}

export async function resetPasswordController(req, res, next) {
  try {
    // reset password service
    const result = await resetUserPassword(req.userPayload, req.body);
    res.status(200).json({
      message: "Password reset successfully!",
      responses: {
        id: result.id,
        username: result.username,
        email: result.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Bonus security save reset token in db
// then delete it after pw changed to prevent double use how?
// create database reset_token + id
// where reset_token, if exist, can update password
// patch update successfully
// delete all tokens where userid
