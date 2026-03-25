import {
  createSessions,
  deleteSessionById,
  getAllSessions,
  getSessionById,
  getSessionsByLocation,
  updateSessionByGroup,
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
    const responses = await getSessionsByLocation(locationId);
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
    const resp = await getSessionById(id);
    res.status(200).json({
      message: "Session retrieved successfully.",
      resp,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSessionController(req, res, next) {
  const { id } = req.params;

  try {
    const resp = await updateSessionById(id, req.body);
    res.status(200).json({
      message: "Session updated successfully.",
      resp,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSessionController(req, res, next) {
  const { id } = req.params;

  try {
    const resp = await deleteSessionById(id);
    res.status(200).json({
      message: "Session deleted successfully.",
      resp,
    });
  } catch (error) {
    next(error);
  }
}

// TO DO
export async function updateGroupSessionController(req, res, next) {
   const { id } = req.params;

  try {
    const resp = await updateSessionByGroup(id, req.body);
    res.status(200).json({
      message: "Group session updated successfully.",
      resp,
    });
  } catch (error) {
    next(error);
  }
}
