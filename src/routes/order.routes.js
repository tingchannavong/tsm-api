import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";
import { validate } from "../middlewares/validate.js";
import { idSchema, GetLocationSchema, CreateSessionSchema, GetSessionsSchema, UpdateSessionSchema, UpdateGroupSessionSchema } from "../validations/session.schema.js";
import { createOrderController, deleteOrderByIdController, getOrderByIdController, getOrderPreviewController, getOrdersController, updateOrderByIdController } from "../controllers/order.controller.js";
import { UpdateOrderSchema } from "../validations/order.schema.js";

const orderRoutes = express.Router();

// TO DO validate data
orderRoutes.post('/preview', checkAuth, getOrderPreviewController);
orderRoutes.post('', checkAuth, createOrderController);

orderRoutes.get('', checkAuth, getOrdersController);
orderRoutes.get('/:id', checkAuth, validate(idSchema), getOrderByIdController);

orderRoutes.patch('/:id', checkAuth, validate(UpdateOrderSchema), updateOrderByIdController)
orderRoutes.delete('/:id', checkAuth, validate(idSchema), deleteOrderByIdController)

export default orderRoutes;
