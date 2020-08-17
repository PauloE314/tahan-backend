import { Router } from 'express';
import { getQuiz } from '@middlewares/index';
import { auth_require, is_teacher, is_student } from "@middlewares/auth"
import { QuizzesController } from '@controllers/quizzes/quizzesController';

const routes = Router({ mergeParams: true });
const controller = new QuizzesController();


// Listagem
routes.get('/', controller.list);

// Criação
routes.post('/', auth_require, is_teacher, controller.create);

// Leitura
routes.get('/public/:quizId([0-9]+)', auth_require, getQuiz, controller.readPublic);
routes.post('/private/:quizId([0-9]+)', auth_require, getQuiz, controller.readPrivate);

// Atualização de quiz
routes.put('/:quizId', auth_require, is_teacher, getQuiz, controller.update);

// Apagar o quiz
routes.delete('/:quizId([0-9]+)', auth_require, is_teacher, getQuiz, controller.delete);

// Responder quiz
routes.post('/:quizId/answer', auth_require, is_student, getQuiz, controller.answer);

// Estatísticas do quiz
routes.get('/:quizId/games', auth_require, is_teacher, getQuiz, controller.games);

export default routes;
