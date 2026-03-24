import {
  createUser,
  findUserById,
  findUserByPhone,
  updatePasswordById,
  verifyUserAuth,
} from "../services/auth.services.js";
import { generateToken } from "../utils/jwt.js";
import createError from "http-errors";
import "dotenv/config";

export async function registerController(req, res, next) {
  const { username, password, phone, email, firstname, lastname, role } =
    req.body;

  const userData = {
    username,
    password,
    phone,
    email,
    firstname,
    lastname,
    role,
  };

  // check role only ADMIN allow to add
  if (req.userPayload.role !== "ADMIN") {
    next(createError(401, "Invalid permission"));
  }

  try {
    const user = await createUser(userData);
    res.status(201).json({ message: "user added successfully", user });
  } catch (error) {
    next(error);
  }
}

export async function loginController(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await verifyUserAuth(username, password);

    if (!user) {
      throw createError(401, "Invalid username or password");
    }

    // Success: proceed
    const { role, id } = user;
    const payload = { username, role, id };
    const access_token = generateToken(payload, process.env.SECRET_KEY, "1h");

    res.status(200).json({ message: "Log in success", access_token });
  } catch (error) {
    next(error);
  }
}

export async function getUserDataController(req, res) {
  try {
    const { id, role, username } = req.userPayload;
    const userData = await findUserById(id);

    res.json({
      message: "Verify success",
      email: userData.email,
      username,
      id,
      role,
    });
  } catch (error) {
    next(error);
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
    console.log(result);
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
  const userData = await updatePasswordById(id, newPassword);

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
