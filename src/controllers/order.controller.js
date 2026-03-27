import createError from "http-errors";
import { createOrder, getOrderPreviewBySession } from "../services/order.service.js";

export async function getOrderPreviewController(req, res, next) {
  const { sessionIds } = req.body;

  try {
    const responses = await getOrderPreviewBySession(sessionIds);
    res.status(200).json({
      message: "Order preview retrieved successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function createOrderController(req, res, next) {
  const { sessionIds, discount } = req.body;

  try {
    const responses = await createOrder(sessionIds, discount);
    res.status(200).json({
      message: "Order created successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}