import { Router } from 'express';

import controllerHandler from '../handlers/controller.handler.js';
import authController from '../controllers/auth.controller.js';

const authRouter = Router();

authRouter.post('/signup', controllerHandler(authController.signup));

authRouter.post('/signupValidate', controllerHandler(authController.signupValidate));

authRouter.post('/signupConfirmEmail', controllerHandler());

authRouter.post('/changePassword', controllerHandler(authController.changePassword));

authRouter.post('/signin', controllerHandler(authController.signin));

authRouter.post('/signinValidate', controllerHandler(authController.signinValidate));

authRouter.get('/verify', controllerHandler(authController.verifyTokens));

authRouter.get('/logout', controllerHandler(authController.logout));

authRouter.get('/generate', controllerHandler(authController.generate));

export default authRouter;