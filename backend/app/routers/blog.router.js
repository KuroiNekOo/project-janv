import { Router } from 'express';

import controllerHandler from '../handlers/controller.handler.js';
import blogController from '../controllers/blog.controller.js';

const blogRouter = Router();

blogRouter.post('/', controllerHandler(blogController.create));

blogRouter.get('/', controllerHandler(blogController.getAll));

blogRouter.get('/:id([0-9]+)', controllerHandler(blogController.getById));

blogRouter.patch('/:id([0-9]+)', controllerHandler(blogController.update));

blogRouter.delete('/:id([0-9]+)', controllerHandler(blogController.delete));

export default blogRouter;