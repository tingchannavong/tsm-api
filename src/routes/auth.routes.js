import express from "express";
import { checkUser, getUserData, login, register, resetPassword } from "../controllers/auth.controller.js";
import { checkAuth, checkResetToken } from "../middlewares/checkAuth.js";

const router = express.Router();

router.post('/register', checkAuth, register);

router.post('/login', login);

router.get('/me', checkAuth, getUserData);

router.post('/forgot-password', checkUser);

router.patch('/reset-password/:token', checkResetToken, resetPassword)

export default router;
