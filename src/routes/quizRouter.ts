import { Router, NextFunction, Response } from 'express';
import { getSection, getQuiz } from '@middlewares/index';
import { auth_require, is_teacher } from "@middlewares/auth"
import QuizzesController from '@controllers/http/quizzesController';
import QuizzesValidator from '@middlewares/validators/quizzesValidator';

const routes = Router({ mergeParams: true });
const controller = new QuizzesController();
const validator = new QuizzesValidator();

// Pega a seção e lida com seções indexistentes
routes.use(getSection);

// Leitura
routes.get('/', controller.list);
routes.post('/', auth_require, is_teacher, validator.create_validation, controller.create);
routes.get('/:id', auth_require, getQuiz,controller.read);

// Update
routes.put('/:id', auth_require, is_teacher, getQuiz, validator.update_validation, controller.update);

// Delete
routes.delete('/:id', auth_require, is_teacher, getQuiz, validator.delete_validation, controller.delete);

// routes.get('/self/', auth_require, is_teacher, controller.list_self);

// routes.get('/:quiz_id', controller.read);

export default routes;
