import express from "express";
import {checkUserController, loginController, logOutController, refreshTokenController, registerController, resetPasswordController } from "../controllers/auth.controller.js";
import { checkAuth, checkResetToken } from "../middlewares/checkAuth.js";
// another clean way to write
// import * as controller from "../controllers/authController.js";
// controller.login

const router = express.Router();

router.post('/register', checkAuth, registerController);

router.post('/login', loginController);
router.post('/logout', checkAuth, logOutController);

// router.get('/me', checkAuth, getUserDataController);

router.post('/forgot-password', checkUserController);

router.get('/refresh-token', refreshTokenController);

router.patch('/reset-password/:token', checkResetToken, resetPasswordController)

export default router;
