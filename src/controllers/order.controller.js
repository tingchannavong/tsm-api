import createError from "http-errors";
import { getOrderPreviewBySession } from "../services/order.service.js";

export async function getOrderPreviewController(req, res, next) {
  const { sessionIds } = req.body;

  try {
    const responses = await getOrderPreviewBySession(sessionIds);
    res.status(200).json({
      message: "Order preview by retrieved successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}