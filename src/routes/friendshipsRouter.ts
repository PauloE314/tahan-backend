import { Router, NextFunction, Response, response } from 'express';
import { auth_require, is_student, is_teacher } from "@middlewares/auth"
import { FriendsController } from '@controllers/friends';
import { FriendsValidator } from '@controllers/friends/validator';
import { FriendsRepository } from 'src/repositories/FriendsRepository';
import { getFriendship } from '@middlewares/index';
import { APIRequest } from 'src/@types';

// const router = new Routes({ mergeParams: true });
const router = Router({ mergeParams: true });

const controller = new FriendsController();


// Listagem
// router.get('/', controller.list );
// router.get('/', (request: APIRequest, response, next) => { controller.list(request, response, next) })
router.get('/', controller.list)
router.get('/test', controller.testes)




export default router;


// routes.get('/', controller.list)

// Criação
// routes.post('/:user_id([0-9]+)', auth_require, controller.create);

// // Aceitação
// routes.post('/friendship_id([0-9]+)', auth_require, getFriendship('friendship_id'), controller.accept);

// // Desfazer amizade
// routes.delete('/friendship_id([0-9]+)', auth_require, getFriendship('friendship_id'), controller.delete);

// // Envio de mensagem
// routes.post('/friendship_id([0-9]+)', auth_require, getFriendship('friendship_id'), controller.message);




