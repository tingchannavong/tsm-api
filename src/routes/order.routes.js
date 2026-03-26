import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";
import { validate } from "../middlewares/validate.js";
import { idSchema, GetLocationSchema, CreateSessionSchema, GetSessionsSchema, UpdateSessionSchema, UpdateGroupSessionSchema } from "../validations/session.schema.js";

const orderRoutes = express.Router();

orderRoutes.post('/preview', registerController);
orderRoutes.post('', loginController);

orderRoutes.get('', checkAuth, getUserDataController);
orderRoutes.get('/:id', checkAuth, getUserDataController);

orderRoutes.patch('/:id', resetPasswordController)
orderRoutes.delete('/:id', resetPasswordController)

export default orderRoutes;
