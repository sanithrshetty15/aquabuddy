import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/inputValidator';
import { authenticate } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/rbac.middleware';
import { getProfile, updateProfile, getUsers, removeUser, changePasswordHandler } from '../controllers/user.controller';

const router = Router();

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty').optional(),
  lastName: z.string().min(1, 'Last name cannot be empty').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.patch('/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.patch('/password', authenticate, changePasswordHandler);

// Admin-only endpoints
router.get('/', authenticate, adminOnly, getUsers);
router.delete('/:id', authenticate, adminOnly, removeUser);

export default router;
