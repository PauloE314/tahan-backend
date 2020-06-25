import { Router } from 'express';
import UserController from '@controllers/userController';
import UserValidator from '@middlewares/validators/userValitators';
import { auth_require } from '@middlewares/auth';
import multer from '@config/multer';


const routes = Router({ mergeParams: true })
const controller = new UserController();
const validator = new UserValidator();


const user_uploads = multer('users').single('image');

routes.get('/', controller.list);
routes.post('/', multer().any(), validator.createUser_validation, controller.create);
routes.post('/login/', validator.login_validation, controller.login);
routes.get('/:id/', validator.read_validation, controller.read)
routes.get('/self/', auth_require, controller.read_self);

export default routes;