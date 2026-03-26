import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";

const pricingRoutes = express.Router();

pricingRoutes.get('', checkAuth, (re, res) => {});

export default pricingRoutes;