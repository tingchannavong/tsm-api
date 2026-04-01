import { createLocation, getAllLocations, getLocationById } from "../services/location.service.js";

export async function createLocationController(req, res, next) {
  const { name, displayName } = req.body;

  const data = { name, displayName };

  // qrCode is system generated

  try {
    const resp = await createLocation(data);
    res.status(201).json({
      message: "Location created successfully",
      resp,
    });
  } catch (error) {
    next(error);
  }
}

export async function getLocationController(req, res, next) {
  const { id } = req.params;

  try {
    const responses = await getLocationById(id);
    res.status(200).json({
      message: "Location retrieved successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllLocationsController(req, res, next) {

  try {
    const responses = await getAllLocations();
    res.status(200).json({
      message: "All locations retrieved successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}