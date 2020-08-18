import { Router } from 'express';
import UserController from '@controllers/users/usersController';
import { auth_require } from '@middlewares/auth';


const routes = Router({ mergeParams: true });
const controller = new UserController();

// Criação / update de usuário
routes.post('/sign-in', controller.signIn);

// Refresh de token
routes.post('/self/refresh', auth_require, controller.refresh);

// Listagem de usuários
routes.get('/', controller.list);

// Leitura de dados do usuário
routes.get('/:target([0-9]+|self)/', auth_require, controller.read);

// Leitura de quizzes do usuário
routes.get('/:target([0-9]+|self)/quizzes', auth_require, controller.quizzes);

// Leitura de postagens do usuário
routes.get('/:target([0-9]+|self)/posts', auth_require, controller.posts);

// Leitura de containers do usuário
routes.get('/:target([0-9]+|self)/post-containers', auth_require, controller.postContainers);

// Delete
routes.delete('/self/', auth_require, controller.delete);


export default routes;