import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";
import { createSessionController, deleteSessionController, getAllSessionsController, getFilteredSessionsController, getSessionController, updateGroupSessionController, updateSessionController  } from "../controllers/session.controller.js";
import { GetSessionSchema, validate } from "../middlewares/validate.js";

const router = express.Router();

router.post('', createSessionController);
router.get('/filter', getFilteredSessionsController);

router.get('', checkAuth, getAllSessionsController);
router.patch('/groups/:id', checkAuth, updateGroupSessionController);

router.get('/:id', getSessionController);
router.patch('/:id', checkAuth, updateSessionController);
router.delete('/:id', checkAuth, deleteSessionController);

export default router;
