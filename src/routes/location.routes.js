import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";
import { createLocationController } from "../controllers/location.controller.js";
import { getLocationById } from "../services/location.service.js";

const locationRoutes = express.Router();

locationRoutes.post('', checkAuth, createLocationController);
locationRoutes.get('', getLocationById);

export default locationRoutes;
