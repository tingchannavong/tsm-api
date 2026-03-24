import {
  createSession,
  deleteSessionById,
  getAllSessions,
  getSessionById,
  getSessionsByLocation,
  updateSessionById,
} from "../services/session.service.js";
import createError from "http-errors";

export async function createSessionController(req, res, next) {
  const { locationId, groupId, people, name1, pricingId } = req.body;

  const data = {};
  const responses = [];
  var newGroupId = "";

  // TO ADD: auto-generate names feature

  try {
    // Create person 1 session first
    if (name1) data.name = name1;
    if (locationId) data.locationId = locationId;
    if (groupId) data.groupId = groupId;
    if (pricingId) data.pricingId = pricingId;

    const resp = await createSession(data);
    newGroupId = resp.groupId;
    responses.push(resp);
  } catch (error) {
    next(error);
  }

  // For group, get group id from response, create the rest
  if (people > 1) {
    const data = {};
    const ppl = Number(people);

    // start at person number 2
    for (var i = 2; i < ppl + 1; i++) {
      const eachName = req.body[`name${i}`];
      data.groupId = newGroupId;

      if (eachName) data.name = eachName;
      if (locationId) data.locationId = locationId;
      if (pricingId) data.pricingId = pricingId;

      try {
        const resp = await createSession(data);
        responses.push(resp);
      } catch (error) {
        next(error);
      }
    }
  }

  res.status(201).json({
    message: "Sessions created successfully",
    responses,
  });
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
