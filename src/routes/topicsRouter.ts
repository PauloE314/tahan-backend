import { Router, NextFunction, Response } from 'express';
import { getSection, getTopic } from '@middlewares/index';
import { auth_require } from "@middlewares/auth"
import TopicController from '@controllers/http/topicsController';
import { APIRequest } from 'src/@types/global';
import TopicValidator from '@middlewares/validators/topicValidators';

const routes = Router({ mergeParams: true });
const controller = new TopicController();
const validator = new TopicValidator();

// Pega a seção e lida com seções indexistentes
routes.use(getSection);

// Leitura
routes.get('/', controller.list);
routes.post('/', auth_require, validator.create_validation, controller.create);
routes.get('/:id', getTopic, controller.read);
routes.put('/:id', auth_require, getTopic, validator.update_validation, controller.update);
routes.delete('/:id', auth_require, getTopic, validator.delete_validation, controller.delete);

// Criar
// routes.post('/', controller.create);

export default routes;
