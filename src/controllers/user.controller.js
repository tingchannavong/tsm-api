import createError from "http-errors";
import "dotenv/config";
import {
  deleteUserById,
  findUserById,
  getAllUsers,
  updateUserById,
} from "../services/user.service.js";

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
      phone: userData.phone,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req, res, next) {
  const { role } = req.userPayload;

  try {
    const responses = await getAllUsers(role);
    res.status(200).json({
      message: "All users retrieved successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  const { id } = req.params;

  try {
    const responses = await updateUserById(id, req.body);
    delete responses.password;
    
    res.status(200).json({
      message: "User updated successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  const { id } = req.params;
  const { role } = req.userPayload;

  try {
    const responses = await deleteUserById(id, role);
    res.status(200).json({
      message: "User deleted successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}
