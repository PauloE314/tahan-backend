import { Router } from 'express';
import UserController from '@controllers/users/usersController';
import UserValidator from '@controllers/users/usersValidator';
import { auth_require, is_teacher, is_student } from '@middlewares/auth';
import { UsersRepository } from '@controllers/users/UsersRepository';

const routes = Router({ mergeParams: true });
const validator = new UserValidator();
const controller = new UserController(validator, UsersRepository);


// Entrar na aplicação
routes.post('/sign-in', controller.signIn.bind(controller));

// Leitura de usuários
routes.get('/', controller.list.bind(controller));
routes.get('/:id([0-9]+)/', controller.read.bind(controller));

// Dados de outros usuários
routes.get('/:id([0-9]+)/posts', controller.posts.bind(controller));
routes.get('/:id([0-9]+)/post-containers', controller.postContainers.bind(controller));

// Dados do usuário logado
routes.get('/self/', auth_require, controller.readSelf.bind(controller));
routes.get('/self/quizzes', auth_require, is_teacher, controller.selfQuizzes.bind(controller));
routes.get('/self/posts', auth_require, is_teacher, controller.selfPosts.bind(controller));
routes.get('/self/post-containers', auth_require, is_teacher, controller.selfPostContainers.bind(controller))


// Delete
routes.delete('/self/', auth_require, controller.delete.bind(controller));


export default routes;