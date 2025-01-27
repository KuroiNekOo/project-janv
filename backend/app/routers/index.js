import { Router } from 'express';

import authRouter from './auth.router.js';
import roleRouter from './role.router.js';
import blogRouter from './blog.router.js';
import ErrorApi from '../utils/errors/api.error.js';

const router = Router();

router.use('/api/v1/auth', authRouter);

router.use('/api/v1/roles', roleRouter);

router.use('/api/v1/blogs', blogRouter);

// Gestion des routes introuvables
router.use((_, __, next) => {
  next(new ErrorApi('NOT_FOUND', 'Resource not found', {status: 404}));
});

export default router;