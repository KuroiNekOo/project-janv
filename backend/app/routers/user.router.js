import { Router } from 'express';

import controllerHandler from '../handlers/controller.handler.js';
import userController from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.get('/', controllerHandler(userController.getAll));

userRouter.put('/', controllerHandler(userController.update));

export default userRouter;