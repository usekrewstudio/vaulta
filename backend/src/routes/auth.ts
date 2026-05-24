import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { signup, verifyOtp, resendOtp, login, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many requests' } });

router.post(
  '/signup',
  authLimiter,
  [
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  signup
);

router.post(
  '/verify-otp',
  authLimiter,
  [
    body('user_id').isUUID().withMessage('Valid user_id required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  verifyOtp
);

router.post('/resend-otp', authLimiter, [body('user_id').isUUID()], resendOtp);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  login
);

router.get('/me', authenticate, getMe);

export default router;
