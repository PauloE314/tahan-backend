import { Router, NextFunction, Response } from 'express';
import { getPost, getTopic } from '@middlewares/index';
import { auth_require } from "@middlewares/auth"
import PostsController from '@controllers/postsController';
import PostsValidator from '@middlewares/validators/postsValidators';

const routes = Router({ mergeParams: true });
const controller = new PostsController();
const validator = new PostsValidator();

// Pega o tópico e lida com tópicos inexistentes
routes.use(getTopic);

// Leitura
routes.get('/', controller.list);
routes.post('/', auth_require, validator.create_validation, controller.create);
routes.get('/:id([0-9]+)/', getPost, controller.read);
routes.put('/:id([0-9]+)/', auth_require, getPost, validator.update_validation, controller.update);
routes.delete('/:id([0-9]+)/', auth_require, getPost, validator.delete_validation, controller.delete);

// Criar
// routes.post('/', controller.create);

export default routes;
