import { Router } from 'express';
import { DBController } from '../controllers/db.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/:table', requireAuth, DBController.handleQuery);

export default router;
