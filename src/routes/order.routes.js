import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";
import { validate } from "../middlewares/validate.js";
import { GetLocationSchema, CreateSessionSchema, GetSessionsSchema, UpdateSessionSchema, UpdateGroupSessionSchema } from "../validations/session.schema.js";
import { createOrderController, deleteOrderByIdController, getOrderByIdController, getOrderPreviewController, getOrdersController, updateOrderByIdController } from "../controllers/order.controller.js";
import { CreateOrderSchema, GetOrdersSchema, UpdateOrderSchema } from "../validations/order.schema.js";
import { IdParamSchema } from "../validations/base.schema.js";

const orderRoutes = express.Router();

orderRoutes.post('/preview', validate(CreateOrderSchema), getOrderPreviewController);
orderRoutes.post('', checkAuth, validate(CreateOrderSchema), createOrderController);

orderRoutes.get('', checkAuth, validate(GetOrdersSchema), getOrdersController);
orderRoutes.get('/:id', checkAuth, validate(IdParamSchema), getOrderByIdController);

orderRoutes.patch('/:id', checkAuth, validate(UpdateOrderSchema), updateOrderByIdController)
orderRoutes.delete('/:id', checkAuth, validate(IdParamSchema), deleteOrderByIdController)

export default orderRoutes;
