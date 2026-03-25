import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";
import { createSessionsController, deleteSessionController, getAllSessionsController, getFilteredSessionsController, getSessionController, updateGroupSessionController, updateSessionController  } from "../controllers/session.controller.js";
import { validate } from "../middlewares/validate.js";
import { idSchema, GetLocationSchema, CreateSessionSchema, GetSessionsSchema, updateSessionSchema } from "../validations/session.schema.js";

const router = express.Router();

router.post('', validate(CreateSessionSchema), createSessionsController);
router.get('/filter', validate(GetLocationSchema), getFilteredSessionsController);

router.get('', checkAuth, validate(GetSessionsSchema), getAllSessionsController);
// below not done
router.patch('/groups/:id', checkAuth, updateGroupSessionController);

router.get('/:id', validate(idSchema), getSessionController);
router.patch('/:id', checkAuth, validate(updateSessionSchema), updateSessionController);
router.delete('/:id', checkAuth, validate(idSchema), deleteSessionController);

export default router;
