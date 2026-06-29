import {
  changeUserPassword,
  logOut,
  manageRefreshToken,
  registerUser,
  verifyUserAuth,
} from "../services/auth.services.js";
import { generateToken } from "../utils/jwt.js";
import createError from "http-errors";
import "dotenv/config";
import { findUserByPhone } from "../services/user.service.js";

export async function registerController(req, res, next) {
  try {
    const user = await registerUser(req.userPayload, req.body);
    res.status(201).json({ message: "User added successfully", user });
  } catch (error) {
    next(error);
  }
}

export async function loginController(req, res, next) {
  try {
    const { username, password } = req.body;
    // save ipaddress and useragent for refresh token best practice, trackable
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'] || 'N/A';
  
    const user = await verifyUserAuth(username, password, ipAddress, userAgent);
    const access_token = user.access_token;
    
    // console.log('user', user);

    // refresh token is sent to front-end as cookie of express
    res.cookie("refreshToken", user.refreshToken, {
      httpOnly: true,
      secure: false
    });
    
    res.status(200).json({ message: "Log in success", access_token});
  } catch (error) {
    next(error);
  }
}

export async function refreshTokenController(req, res, next) {
  try {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'] || 'N/A';
    const oldRefreshToken = req.cookies.refreshToken;
    
    const result = await manageRefreshToken(oldRefreshToken, ipAddress, userAgent);
    const access_token = result.access_token;
    // console.log('result of new refresh token', result)
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false
    });
    
    res.status(200).json({ message: "success refresh", access_token});
  } catch (error) {
    next(error)
  }
}

export async function logOutController(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    const result = await logOut(refreshToken);
    
    res.status(200).json({ message: "Log out success"});
  } catch (error) {
    next(error)
  }
}

export async function changePasswordController(req, res, next) {
  const { id } = req.params;
  const currentUser = {
    id: req.userPayload.id,
    role: req.userPayload.role
  }

  try {
    // CHANGE PASSWORD SERVICE  
    const responses = await changeUserPassword(currentUser, id, req.body)  

    res.status(200).json({ message: "Password change successful."});
  } catch (error) {
    next(error)
  }
}

// Later
export async function checkUserController(req, res) {
  const { phone } = req.body;

  const user = await findUserByPhone(phone);
  console.log(user);
  // check if phone exist
  if (user) {
    console.log("this user phone exist, creating reset token");
    const payload = { phone, id: user.id };
    // call jwt function to create token
    const resetToken = generateToken(payload, process.env.RESET_KEY, "10m");
    // set token and id in token table bonus extra security
    const result = await createTokenIdentity(resetToken, user.id);

    // create reset link
    const resetLink = `/auth/reset-password/${resetToken}`;
    // send resetLink to front end
    // which front end need to use the exact same at path for react router to link to page
    // front end makes page  for click in real life
    return res.json({ resetToken, resetLink });
  } else if (user === null) {
    throw createError(401, "phone number does not exist in our system");
  }
}

export async function resetPasswordController(req, res) {
  const newPassword = re.body.password;

  const id = Number(req.userPayload.id);
  // todo: check that identity exists

  // if yes, hash the new password and save to db
  // need to write reset password logic, check
  // const userData = await updatePasswordById(id, newPassword);

  // todo: clear token data table where id

  res.json({
    message: "update password success!",
    userData,
  });
}

// bonus save reset token in db
// then delete it after pw changed to prevent double use how?
// create database reset_token + id
// where reset_token, if exist, can update password
// patch update successfully
// delete all tokens where userid
