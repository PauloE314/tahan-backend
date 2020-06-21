import { Router } from 'express';
import UserController from './controllers';

const routes = Router({ mergeParams: true })
const controller = new UserController();

routes.get('/', controller.list)

export default routes;