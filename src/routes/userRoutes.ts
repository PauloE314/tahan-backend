import { Router } from 'express';
import UserController from '@controllers/http/userController';
import UserValidator from '@middlewares/validators/userValitators';
import { auth_require } from '@middlewares/auth';


const routes = Router({ mergeParams: true })
const controller = new UserController();
const validator = new UserValidator();


// Criar
routes.post('/', validator.createUser_validation, controller.create);

// Leitura
routes.get('/', controller.list);
routes.get('/self/', auth_require, controller.read_self);
routes.get('/:id/', validator.read_validation, controller.read)


// Update
routes.put('/self/', auth_require, validator.update_validation, controller.update);

// Delete
routes.delete('/self/', auth_require, controller.delete);

// Outros
routes.post('/login/', validator.login_validation, controller.login);

export default routes;