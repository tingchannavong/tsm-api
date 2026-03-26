import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";
import { createLocationController } from "../controllers/location.controller.js";

const locationRoutes = express.Router();

locationRoutes.post('', checkAuth, createLocationController);

export default locationRoutes;
