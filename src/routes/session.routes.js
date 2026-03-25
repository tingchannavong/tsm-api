import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";
import { createSessionsController, deleteSessionController, getAllSessionsController, getFilteredSessionsController, getSessionController, updateGroupSessionController, updateSessionController  } from "../controllers/session.controller.js";
import { validate } from "../middlewares/validate.js";
import { GetSessionSchema } from "../validations/session.schema.js";

const router = express.Router();

router.post('', createSessionsController);
router.get('/filter', getFilteredSessionsController);

router.get('', checkAuth, getAllSessionsController);
router.patch('/groups/:id', checkAuth, updateGroupSessionController);

router.get('/:id', validate(GetSessionSchema), getSessionController);
router.patch('/:id', checkAuth, updateSessionController);
router.delete('/:id', checkAuth, deleteSessionController);

export default router;
