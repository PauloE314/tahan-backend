import { Router } from 'express';
import UserController from '@controllers/users/usersController';
import UserValidator from '@controllers/users/usersValidator';
import { auth_require, is_teacher, is_student } from '@middlewares/auth';
import { UsersRepository } from '@controllers/users/UsersRepository';

const routes = Router({ mergeParams: true });
const validator = new UserValidator();
const controller = new UserController(validator, UsersRepository);


// Autenticação
routes.post('/sign-in', controller.signIn.bind(controller));
routes.post('/self/refresh', auth_require, controller.refresh.bind(controller));


// Listagem de usuários
routes.get('/', controller.list.bind(controller));

// Outros usuários
routes.get('/:target([0-9]+|self)/', auth_require, controller.read.bind(controller));
routes.get('/:target([0-9]+|self)/quizzes', auth_require, controller.quizzes.bind(controller));
routes.get('/:target([0-9]+|self)/posts', auth_require, controller.posts.bind(controller));
routes.get('/:target([0-9]+|self)/post-containers', auth_require, controller.postContainers.bind(controller));

// Dados do usuário logado
// routes.get('/self/', auth_require, controller.readSelf.bind(controller));


// Delete
routes.delete('/self/', auth_require, controller.delete.bind(controller));


export default routes;