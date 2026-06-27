import express from "express";
import { checkAuth, checkResetToken } from "../middlewares/checkAuth.js";
// another clean way to write
import * as controller from "../controllers/user.controller.js";

const router = express.Router();

router.get('/me', checkAuth, controller.getUserData);

export default router;
