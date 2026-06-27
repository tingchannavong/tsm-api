import express from "express";
import { checkAuth, checkResetToken } from "../middlewares/checkAuth.js";
// another clean way to write
import * as controller from "../controllers/user.controller.js";

const router = express.Router();

router.get('/', checkAuth, controller.getUsers);
router.get('/me', checkAuth, controller.getUserData);

router.patch('/:id', checkAuth, controller.updateUser);
router.delete('/:id', checkAuth, controller.deleteUser);

export default router;
