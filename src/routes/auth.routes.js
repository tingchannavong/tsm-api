import express from "express";
import {changePasswordController, checkUserController, loginController, logOutController, refreshTokenController, registerController, registerInvitationController, resetPasswordController, userRegisterController } from "../controllers/auth.controller.js";
import { checkAuth, checkInviteToken, checkResetToken } from "../middlewares/checkAuth.js";
import { validate } from "../middlewares/validate.js";
import { ChangePasswordSchema, ResetPasswordSchema } from "../validations/auth.schema.js";
// another clean way to write
// import * as controller from "../controllers/authController.js";
// controller.login

const router = express.Router();

router.post('/register/:token', checkInviteToken, userRegisterController);
router.post('/register-invite', checkAuth, registerInvitationController);
router.post('/register', checkAuth, registerController);

router.post('/login', loginController);
router.post('/logout', checkAuth, logOutController);

router.get('/refresh-token', refreshTokenController);

router.post('/forgot-password', checkUserController);
router.post('/reset-password/:token', checkResetToken, validate(ResetPasswordSchema), resetPasswordController)

router.post('/change-password/users/:id', checkAuth, validate(ChangePasswordSchema), changePasswordController)

export default router;
