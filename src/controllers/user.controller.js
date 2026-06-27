import createError from "http-errors";
import "dotenv/config";
import { findUserById } from "../services/user.service.js";

export async function getUserData(req, res, next) {
  try {
    const { id, role, username } = req.userPayload;
    const userData = await findUserById(id);

    res.json({
      message: "Verify success",
      email: userData.email,
      username,
      id,
      role,
      firstname: userData.firstname,
      lastname: userData.lastname,
      phone: userData.phone
    });
  } catch (error) {
    next(error);
  }
}