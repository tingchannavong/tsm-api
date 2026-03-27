import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";
import { validate } from "../middlewares/validate.js";
import { idSchema, GetLocationSchema, CreateSessionSchema, GetSessionsSchema, UpdateSessionSchema, UpdateGroupSessionSchema } from "../validations/session.schema.js";
import { createOrderController, getOrderPreviewController } from "../controllers/order.controller.js";

const orderRoutes = express.Router();

// TO DO validate data
orderRoutes.post('/preview', getOrderPreviewController);
orderRoutes.post('', createOrderController);

orderRoutes.get('', checkAuth, (re, res) => {});
orderRoutes.get('/:id', checkAuth, (re, res) => {});

orderRoutes.patch('/:id', (re, res) => {})
orderRoutes.delete('/:id', (re, res) => {})

export default orderRoutes;
