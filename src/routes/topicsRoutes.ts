import { Router } from 'express';
import TopicController from '@controllers/topicsController';
import TopicValidator from '@middlewares/validators/topicsValidators';

const routes = Router({ mergeParams: true });
const controller = new TopicController();
const validator = new TopicValidator();

// Leitura
routes.get('/', controller.list);


export default routes;
