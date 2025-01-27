import { Router } from 'express';

import controllerHandler from '../handlers/controller.handler.js';
import permissionController from '../controllers/permission.controller.js';

const permissionRouter = Router();

permissionRouter.post('/', controllerHandler());

permissionRouter.get('/', controllerHandler(permissionController.read));

permissionRouter.get('/:id([0-9]+)', controllerHandler(permissionController.readById));

permissionRouter.patch('/:id([0-9]+)', controllerHandler());

permissionRouter.delete('/:id([0-9]+)', controllerHandler());

export default permissionRouter;