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
routes.get('/public/:id([0-9]+)', auth_require, getQuiz, controller.readPublic);
routes.post('/private/:id([0-9]+)', auth_require, getQuiz, controller.readPrivate);

// // Leitura
// routes.get('/', controller.list);
// routes.get('/:id', getQuiz, validator.read_quiz_validation, controller.read);

// // Update
// routes.put('/:id', auth_require, is_teacher, getQuiz, validator.update_validation, controller.update);

// // Delete
// routes.delete('/:id', auth_require, is_teacher, getQuiz, validator.delete_validation, controller.delete);

// // Responder pergunta
// routes.post('/:id/answer', auth_require, is_student, getQuiz, validator.answer_validation, controller.answer);

// // Ver estatísticas de questão
// routes.get('/:id/games', auth_require, is_teacher, getQuiz, validator.games_validation, controller.games);

export default routes;
