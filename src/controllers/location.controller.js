import { createLocation } from "../services/location.service.js";

export async function createLocationController(req, res, next) {
  const { name, displayName } = req.body;

  const data = { name, displayName };

  // qrCode is system generated
  // if (qrCode) data.qrCode = qrCode;

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
