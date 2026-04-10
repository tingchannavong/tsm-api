import { deleteUserById, getAllUsers, getUserById } from "../services/user.service";

export async function getUserController(req, res, next) {
  const id = Number(req.params.id);
  try {
    const responses = await getUserById(id);
    res.status(201).json({
      message: "User retrieved successfully",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUserController(req, res, next) {
  const id = Number(req.params.id);
  try {
    const responses = await deleteUserById(id);
    res.status(201).json({
      message: "Deleted user successfully",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsersController(req, res, next) {
  try {
    const responses = await getAllUsers();
    res.status(201).json({
      message: "All users retrieved successfully",
      responses,
    });
  } catch (error) {
    next(error);
  }
}
