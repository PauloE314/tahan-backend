import { Router } from 'express';
import { auth_require } from "@middlewares/auth"
import { FriendsController } from '@controllers/friends/friendsController';
import { FriendsValidator } from '@controllers/friends/friendsValidator';
import { FriendsRepository } from '@controllers/friends/friendsRepository';
import { getSolicitation, getFriendship } from '@middlewares/index';

const router = Router({ mergeParams: true });

const validator = new FriendsValidator();
const controller = new FriendsController(FriendsRepository, validator);


// Listagem de solicitações
router.get('/solicitations/', auth_require, controller.listSolicitations.bind(controller));


router.post('/solicitations/', auth_require, controller.sendSolicitation.bind(controller));

router.post('/solicitations/:solicitationId([0-9]+)/answer/', auth_require, getSolicitation, controller.answerSolicitation.bind(controller));

router.delete('/solicitations/:solicitationId([0-9]+)', auth_require, getSolicitation, controller.deleteSolicitation.bind(controller));



// Amigos
router.get('/', auth_require, controller.listFriends.bind(controller));

// router.get('/:friendshipId([0-9]+)', auth_require, getFriendship, controller.readFriendship.bind(controller))

router.delete('/:friendshipId([0-9]+)', auth_require, getFriendship, controller.deleteFriendship.bind(controller))


export default router;