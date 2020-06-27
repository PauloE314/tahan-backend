import { Router } from 'express';
import topicController from '@controllers/topicsController';
import { getSection } from '@middlewares/topics';
import { auth_require } from "@middlewares/auth"

const routes = Router({ mergeParams: true });
const controller = new topicController();

// Leitura
routes.use(getSection);
routes.get('/', controller.list);
routes.post('/', auth_require, controller.create);

// Criar
// routes.post('/', controller.create);

export default routes;
