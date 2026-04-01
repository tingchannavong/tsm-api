import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";
import { createLocationController, getAllLocationsController, getLocationController } from "../controllers/location.controller.js";

const locationRoutes = express.Router();

locationRoutes.post('', checkAuth, createLocationController);
locationRoutes.get('', checkAuth, getAllLocationsController);

locationRoutes.get('/:id', getLocationController);


export default locationRoutes;
