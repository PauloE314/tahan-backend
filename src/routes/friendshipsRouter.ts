import { Router } from 'express';
import { auth_require } from "@middlewares/auth"
import { FriendsController } from '@controllers/friends/friendsController';
import { FriendsValidator } from '@controllers/friends/friendsValidator';
import { FriendsRepository } from '@controllers/friends/friendsRepository';

const router = Router({ mergeParams: true });

const validator = new FriendsValidator();
const controller = new FriendsController(FriendsRepository, validator);

// Listagem de amigos
router.get('/', auth_require, controller.listFriends.bind(controller));
router.get('/:friendshipId([0-9]+)', auth_require, controller.readFriendship.bind(controller))


// Listagem de solicitações
router.get(
    '/solicitations/:type(sended|received|all)',
    auth_require,
    controller.listSolicitations.bind(controller)
);

// Solicitações
router.post('/solicitations/send/', auth_require, controller.sendSolicitation.bind(controller));
router.post('/solicitations/:solicitationId([0-9]+)/answer/', auth_require, controller.answerSolicitation.bind(controller));
router.delete('/solicitations/:solicitationId([0-9]+)', auth_require, controller.deleteSolicitation.bind(controller));

// Acabar com amizade
router.delete('/:friendshipId([0-9]+)', auth_require, controller.deleteFriendship.bind(controller))

// Enviar mensagem
router.post('/:friendshipId([0-9]+)/send-message', auth_require, controller.sendMessage.bind(controller))



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




