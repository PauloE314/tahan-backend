import { Router } from 'express';
import { auth_require } from "@middlewares/auth"
import { FriendsController } from '@controllers/friends/friendsController';
import { FriendsValidator } from '@controllers/friends/friendsValidator';
import { FriendsRepository } from '@controllers/friends/friendsRepository';
import { getSolicitation, getFriendship } from '@middlewares/index';

const router = Router({ mergeParams: true });

const controller = new FriendsController();


// Listagem de solicitações
router.get('/solicitations/', auth_require, controller.listSolicitations);

// Envio de solicitação
router.post('/solicitations/', auth_require, controller.sendSolicitation);

// Resposta de solicitação
router.post('/solicitations/:solicitationId([0-9]+)/answer/', auth_require, getSolicitation(), controller.answerSolicitation);

// Delete de solicitação
router.delete('/solicitations/:solicitationId([0-9]+)', auth_require, getSolicitation(), controller.deleteSolicitation);


// Listagem de amigos
router.get('/', auth_require, controller.listFriends);

// Delete de amizade
router.delete('/:friendshipId([0-9]+)', auth_require, getFriendship, controller.deleteFriendship)


export default router;