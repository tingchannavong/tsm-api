import { createSession } from "../services/session.service.js";

export async function createSessionController(req, res, next) {
  const { locationId, groupId, people, name1, pricingId } = req.body;

  const data = {};
  const responses = [];
  var newGroupId = '';
  
  // Create person 1 session first
  if (name1) data.name = name1;
  if (locationId) data.locationId = locationId;
  if (groupId) data.groupId = groupId;
  if (pricingId) data.pricingId = pricingId;

  try {
    const resp = await createSession(data);
    newGroupId = resp.groupId
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

    res.status(201).json({
      message: "Sessions created successfully",
      responses,
    });
  }
}

export async function getAllSessionsController(req, res, next) {
  res.send("get all sessions");
}

export async function getFilteredSessionsController(req, res, next) {
  res.send("get session by filter");
}

export async function getSessionController(req, res, next) {
  res.send("get session by id");
}

export async function updateSessionController(req, res, next) {
  res.send("update session by id");
}

export async function deleteSessionController(req, res, next) {
  res.send("delete session by id");
}

export async function updateGroupSessionController(req, res, next) {
  res.send("update by group");
}
