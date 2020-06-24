import { Router } from 'express';
import UserController from '../controllers/userController';
import UserValidator from '../middlewares/validators/userValitators';

const routes = Router({ mergeParams: true })
const controller = new UserController();
const validator = new UserValidator();


routes.get('/', controller.list)
routes.post('/', validator.createUser_validation, controller.create)

export default routes;