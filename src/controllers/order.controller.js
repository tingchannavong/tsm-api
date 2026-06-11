import createError from "http-errors";
import { createOrder, deleteOrderById, getAllOrdersWithDetails, getOrderById, getOrderPreviewBySession, updateOrderById } from "../services/order.service.js";

export async function getOrderPreviewController(req, res, next) {

  try {
    const responses = await getOrderPreviewBySession(req.body);
    res.status(200).json({
      message: "Order preview retrieved successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function createOrderController(req, res, next) {
  try {
    const responses = await createOrder(req.body);
    res.status(200).json({
      message: "Order created successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrdersController(req, res, next) {
  try {
    const responses = await getAllOrdersWithDetails(req.validated.query);
    res.status(200).json({
      message: "Orders retrieved successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderByIdController(req, res, next) {
   const { id } = req.params;
  try {
    const responses = await getOrderById(id);
    res.status(200).json({
      message: "Order retrieved successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderByIdController(req, res, next) {
   const { id } = req.params;
  try {
    const responses = await updateOrderById(id, req.body);
    res.status(200).json({
      message: "Order updated successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteOrderByIdController(req, res, next) {
   const { id } = req.params;
   const {role } = req.userPayload;

  try {
    const responses = await deleteOrderById(id, role);
    res.status(200).json({
      message: "Order deleted successfully.",
      responses,
    });
  } catch (error) {
    next(error);
  }
}