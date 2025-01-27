import { Router } from 'express';

import controllerHandler from '../handlers/controller.handler.js';
import userController from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.post('/', controllerHandler());

userRouter.get('/', controllerHandler(userController.read));

userRouter.get('/:id([0-9]+)', controllerHandler(userController.readById));

userRouter.patch('/:id([0-9]+)', controllerHandler());

userRouter.delete('/:id([0-9]+)', controllerHandler());

export default userRouter;