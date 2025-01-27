import { Router } from 'express';

import controllerHandler from '../handlers/controller.handler.js';
import roleController from '../controllers/role.controller.js';

const roleRouter = Router();

roleRouter.post('/', controllerHandler(roleController.create));

roleRouter.get('/', controllerHandler(roleController.getAll));

roleRouter.get('/:id([0-9]+)', controllerHandler(roleController.getById));

roleRouter.patch('/:id([0-9]+)', controllerHandler(roleController.update));

roleRouter.delete('/:id([0-9]+)', controllerHandler(roleController.delete));

export default roleRouter;