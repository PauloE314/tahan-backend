import { Router, NextFunction, Response, response } from 'express';
import { auth_require, is_student, is_teacher } from "@middlewares/auth"
import { FriendsController } from '@controllers/friends/friendsController';
import { FriendsValidator } from '@controllers/friends/friendsValidator';
import { FriendsRepository } from 'src/repositories/FriendsRepository';
import { getFriendship } from '@middlewares/index';
import { APIRequest } from 'src/@types';

// const router = new Routes({ mergeParams: true });
const router = Router({ mergeParams: true });

const validator = new FriendsValidator(FriendsRepository);
const controller = new FriendsController(FriendsRepository, validator);

// Listagem de amigos
router.get(
    '/',
    auth_require,
    controller.list_friends.bind(controller)
);

// Listagem de solicitações
router.get(
    '/solicitations/:type(sended|received|all)',
    auth_require,
    controller.list_solicitations.bind(controller)
);

// Envio de solicitações
router.post(
    '/send/:user_id([0-9]+)',
    auth_require,
    controller.send_solicitation.bind(controller)
);




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




