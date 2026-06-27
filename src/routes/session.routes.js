import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";
import { createSessionsController, deleteSessionController, endSessionsController, getAllSessionsController, getFilteredSessionsController, getSessionController, updateGroupSessionController, updateSessionController  } from "../controllers/session.controller.js";
import { validate } from "../middlewares/validate.js";
import { GetLocationSchema, CreateSessionSchema, GetSessionsSchema, UpdateSessionSchema, UpdateGroupSessionSchema } from "../validations/session.schema.js";
import { IdParamSchema } from "../validations/base.schema.js";

const router = express.Router();

router.post('', validate(CreateSessionSchema), createSessionsController);
router.get('/filter', validate(GetSessionsSchema), getFilteredSessionsController);

router.get('', checkAuth, validate(GetSessionsSchema), getAllSessionsController);
// below done update end time only
router.patch('/groups/:id', checkAuth, validate(UpdateGroupSessionSchema), updateGroupSessionController);
router.patch('/end', checkAuth, endSessionsController);

router.get('/:id', validate(IdParamSchema), getSessionController);
router.patch('/:id', checkAuth, validate(UpdateSessionSchema), updateSessionController);
router.delete('/:id', checkAuth, validate(IdParamSchema), deleteSessionController);

export default router;
