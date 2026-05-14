import {
  createSessions,
  deleteSessionById,
  getAllSessions,
  getSessionById,
  getSessionsByFilter,
  endGroupSessions,
  updateSessionById,
  endIndividualSessions,
} from "../services/session.service.js";
import createError from "http-errors";
import { accumulateSameStartTimes } from "../utils/core.js";

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
  try {
    const responses = await getSessionsByFilter(req.query);

    let sameStartTimes;
    responses.forEach((each) => {
      sameStartTimes = accumulateSameStartTimes(each.items);
    });

    res.status(200).json({
      message: "Sessions by location retrieved successfully.",
      grouped: responses,
      sameStartTimes,
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
    const responses = await endGroupSessions("groupId", id, req.body);
    res.status(200).json({
      message: "Group session updated successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function endSessionsController(req, res, next) {

  try {
    const responses = await endIndividualSessions(req.body);
    res.status(200).json({
      message: "Individual sessions updated successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}
