import { Router } from 'express';
import { SkillsController } from '../controllers/skills.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/gap', requireAuth, SkillsController.getGapReport);

export default router;
