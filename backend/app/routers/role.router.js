import { Router } from 'express';

import controllerHandler from '../handlers/controller.handler.js';
import roleController from '../controllers/role.controller.js';

const roleRouter = Router();

roleRouter.post('/', controllerHandler());

roleRouter.get('/', controllerHandler(roleController.read));

roleRouter.get('/:id([0-9]+)', controllerHandler(roleController.readById));

roleRouter.patch('/:id([0-9]+)', controllerHandler());

roleRouter.delete('/:id([0-9]+)', controllerHandler());

export default roleRouter;