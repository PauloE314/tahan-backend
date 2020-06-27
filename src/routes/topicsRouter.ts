import { Router } from 'express';
import topicController from '@controllers/topicsController';

const routes = Router({ mergeParams: true });
const controller = new topicController();

// Leitura
// routes.get('/', controller.list);

// Criar
// routes.post('/', controller.create);

export default routes;
