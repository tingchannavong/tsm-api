import {
  createSessions,
  deleteSessionById,
  getAllSessions,
  getSessionById,
  getSessionsByLocation,
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
    next(error)
  }
}

export async function getFilteredSessionsController(req, res, next) {
  const { locationId } = req.query;

  if (!locationId) {
    next(createError(400), "Filter not valid");
  }

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
  const { groupId, locationId, status } = req.query;

  const filters = {};
  if (groupId) filters.groupId = groupId;
  if (locationId) filters.locationId = locationId;
  if (status) filters.status = status;

  try {
    const responses =
      Object.keys(filters).length === 0
        ? await getAllSessions()
        : await getAllSessions(filters);

    res.status(200).json({
      message: "All sessions successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

// zod
export async function getSessionController(req, res, next) {
  const id = Number(req.params.id);

  // can do via zod
  if (isNaN(id)) {
    next(createError(400, "Id is not a number"));
  }

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
  const id = Number(req.params.id);

  // can do via zod
  if (isNaN(id)) {
    next(createError(400, "Id is not a number"));
  }
  console.log(req.body)
  const { status, name, startTime, endTime } = req.body;
  const data = {};

  // logic is end time after start time
  // auto calc duration min from db how?

  try {
    if (status) data.status = status;
    if (name) data.name = name;
    if (startTime) data.startTime = startTime;
    if (endTime) data.endTime = endTime;

    const resp = await updateSessionById(id, data);
    res.status(200).json({
      message: "Session updated successfully.",
      resp,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSessionController(req, res, next) {
  const id = Number(req.params.id);

  // can do via zod
  if (isNaN(id)) {
    next(createError(400, "Id is not a number"));
  }

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

export async function updateGroupSessionController(req, res, next) {
  res.send("update by group");
}
