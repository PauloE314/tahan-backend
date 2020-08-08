import { Router } from 'express';
import { TopicsController } from '@controllers/topics/topicsController';

const routes = Router({ mergeParams: true });
const controller = new TopicsController();

// Leitura
routes.get('/', controller.list);


export default routes;
