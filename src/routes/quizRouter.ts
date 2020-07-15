import { Router, NextFunction, Response } from 'express';
import { getSection, getQuiz } from '@middlewares/index';
import { auth_require, is_teacher, is_student } from "@middlewares/auth"
import QuizzesController from '@controllers/quizzesController';
import QuizzesValidator from '@middlewares/validators/quizzesValidator';
import router from 'src/app/router';

const routes = Router({ mergeParams: true });
const controller = new QuizzesController();
const validator = new QuizzesValidator();

// Pega a seção e lida com seções indexistentes
routes.use(getSection);

// Criação
routes.post('/', auth_require, is_teacher, validator.create_validation, controller.create);

// Leitura
routes.get('/', controller.list);
routes.get('/:id', auth_require, getQuiz,controller.read);

// Update
routes.put('/:id', auth_require, is_teacher, getQuiz, validator.update_validation, controller.update);

// Delete
routes.delete('/:id', auth_require, is_teacher, getQuiz, validator.delete_validation, controller.delete);

// Responder pergunta
routes.post('/:id/answer', auth_require, is_student, getQuiz, validator.answer_validation, controller.answer);

// Ver estatísticas de questão
routes.get('/:id/games', auth_require, is_teacher, getQuiz, validator.games_validation, controller.games);

export default routes;
