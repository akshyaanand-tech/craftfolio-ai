import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.get('/user', requireAuth, AuthController.getUser);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', requireAuth, AuthController.resetPassword);

export default router;
