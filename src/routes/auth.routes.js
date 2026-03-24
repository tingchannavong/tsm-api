import express from "express";
import {checkUserController, getUserDataController, loginController, registerController, resetPasswordController } from "../controllers/auth.controller.js";
import { checkAuth, checkResetToken } from "../middlewares/checkAuth.js";

const router = express.Router();

router.post('/register', checkAuth, registerController);

router.post('/login', loginController);

router.get('/me', checkAuth, getUserDataController);

router.post('/forgot-password', checkUserController);

router.patch('/reset-password/:token', checkResetToken, resetPasswordController)

export default router;
