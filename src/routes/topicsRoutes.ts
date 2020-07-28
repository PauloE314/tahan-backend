import { Router } from 'express';
import TopicController from '@controllers/topicsController';

const routes = Router({ mergeParams: true });
const controller = new TopicController();

// Leitura
routes.get('/', controller.list);


export default routes;
