import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";
import { createSessionsController, deleteSessionController, getAllSessionsController, getFilteredSessionsController, getSessionController, updateGroupSessionController, updateSessionController  } from "../controllers/session.controller.js";
import { validate } from "../middlewares/validate.js";
import { idSchema, GetLocationSchema, CreateSessionSchema, GetSessionsSchema, UpdateSessionSchema, UpdateGroupSessionSchema } from "../validations/session.schema.js";

const router = express.Router();

router.post('', validate(CreateSessionSchema), createSessionsController);
router.get('/filter', validate(GetLocationSchema), getFilteredSessionsController);

router.get('', checkAuth, validate(GetSessionsSchema), getAllSessionsController);
// below done update end time only
router.patch('/groups/:id', checkAuth, validate(UpdateGroupSessionSchema), updateGroupSessionController);

router.get('/:id', validate(idSchema), getSessionController);
router.patch('/:id', checkAuth, validate(UpdateSessionSchema), updateSessionController);
router.delete('/:id', checkAuth, validate(idSchema), deleteSessionController);

export default router;
