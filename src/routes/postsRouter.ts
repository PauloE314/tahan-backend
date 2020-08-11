import { Router, NextFunction, Response } from 'express';
import { getPost } from '@middlewares/index';
import { auth_require, is_teacher } from "@middlewares/auth"
import { PostsController } from '@controllers/posts/postsController';
import { PostsValidator } from '@controllers/posts/postsValidator';
import { PostsRepository } from '@controllers/posts/postsRepository';


const validator = new PostsValidator();
const controller = new PostsController(PostsRepository, validator);
const routes = Router({ mergeParams: true });


// Leitura de postagens
routes.get('/', controller.list.bind(controller));
routes.get('/:id([0-9]+)', getPost, controller.read.bind(controller));

// // Criação
routes.post('/', auth_require, is_teacher, controller.create.bind(controller));

// Update
routes.put('/:id([0-9]+)/', auth_require, is_teacher, getPost, controller.update.bind(controller));

// // Delete
routes.delete('/:id([0-9]+)/', auth_require, is_teacher, getPost, controller.delete.bind(controller));

// // Outros
routes.post('/:id([0-9]+)/like', auth_require, getPost, controller.like.bind(controller))

routes.post('/:id([0-9]+)/comment', auth_require, getPost, controller.comment.bind(controller))


// Criar
// routes.post('/', controller.create);

export default routes;
