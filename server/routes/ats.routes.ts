import { Router } from 'express';
import { ATSController } from '../controllers/ats.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/analyze', requireAuth, ATSController.analyze);

export default router;
