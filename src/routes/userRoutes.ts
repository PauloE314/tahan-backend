import { Router } from 'express';
import UserController from '@controllers/userController';
import UserValidator from '@middlewares/validators/userValitators';
import { auth_require } from '@middlewares/auth';

const routes = Router({ mergeParams: true })
const controller = new UserController();
const validator = new UserValidator();


// Entrar na aplicação
routes.post('/sign-in', validator.signIn_validation, controller.sign_in);

// Leitura
routes.get('/', controller.list);
routes.get('/self/', auth_require, controller.read_self);
routes.get('/:id([0-9]+)/', controller.read);

// Delete
routes.delete('/self/', auth_require, controller.delete);


export default routes;