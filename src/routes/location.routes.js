import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";
import { createLocationController, getLocationController } from "../controllers/location.controller.js";

const locationRoutes = express.Router();

locationRoutes.post('', checkAuth, createLocationController);
locationRoutes.get('/:id', getLocationController);

export default locationRoutes;
