import { Router } from 'express';

import authRouter from './auth.router.js';
import userRouter from './user.router.js';
import roleRouter from './role.router.js';
import permissionRouter from './permission.router.js';
import ErrorApi from '../utils/errors/api.error.js';

const router = Router();

router.use('/api/v1/auth', authRouter);

router.use('/api/v1/users', userRouter);

router.use('/api/v1/roles', roleRouter);

router.use('/api/v1/permissions', permissionRouter);

// Gestion des routes introuvables
router.use((_, __, next) => {
  next(new ErrorApi('NOT_FOUND', 'Resource not found', {status: 404}));
});

export default router;