import express from "express";
import {changePasswordController, checkUserController, loginController, logOutController, refreshTokenController, registerController, resetPasswordController } from "../controllers/auth.controller.js";
import { checkAuth, checkResetToken } from "../middlewares/checkAuth.js";
import { validate } from "../middlewares/validate.js";
import { ChangePasswordSchema } from "../validations/auth.schema.js";
// another clean way to write
// import * as controller from "../controllers/authController.js";
// controller.login

const router = express.Router();

router.post('/register', checkAuth, registerController);

router.post('/login', loginController);
router.post('/logout', checkAuth, logOutController);

router.get('/refresh-token', refreshTokenController);

router.post('/forgot-password', checkUserController);
router.patch('/reset-password/:token', checkResetToken, resetPasswordController)

router.post('/change-password/users/:id', checkAuth, validate(ChangePasswordSchema), changePasswordController)

export default router;
