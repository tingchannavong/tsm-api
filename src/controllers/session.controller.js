import {
  createSessions,
  deleteSessionById,
  getAllSessions,
  getSessionById,
  getSessionsByFilter,
  updateSessionByField,
  updateSessionById,
} from "../services/session.service.js";
import createError from "http-errors";

export async function createSessionsController(req, res, next) {
  try {
    const responses = await createSessions(req.body);
    res.status(201).json({
      message: "Session(s) created successfully",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFilteredSessionsController(req, res, next) {
  const { locationId } = req.query;

  try {
    const responses = await getSessionsByFilter({locationId, status: "ACTIVE"});
    res.status(200).json({
      message: "Sessions by location retrieved successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllSessionsController(req, res, next) {
  try {
    const responses = await getAllSessions(req.query);

    res.status(200).json({
      message: "All sessions retrieved successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSessionController(req, res, next) {
  const { id } = req.params;

  try {
    const responses = await getSessionById(id);
    res.status(200).json({
      message: "Session retrieved successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSessionController(req, res, next) {
  const { id } = req.params;

  try {
    const responses = await updateSessionById(id, req.body);
    res.status(200).json({
      message: "Session updated successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSessionController(req, res, next) {
  const { id } = req.params;

  try {
    const responses = await deleteSessionById(id);
    res.status(200).json({
      message: "Session deleted successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateGroupSessionController(req, res, next) {
   const { id } = req.params;

  try {
    const responses = await updateSessionByField("groupId", id, req.body);
    res.status(200).json({
      message: "Group session updated successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}