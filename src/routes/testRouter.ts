import { Router } from 'express';
import sectionController from '@controllers/topicsController';
import SectionValidator from '@middlewares/validators/topicsValidators';
import room_manager from 'src/socket/helpers/rooms';
import Client from 'src/socket/helpers/client';

const routes = Router({ mergeParams: true });

// Leitura
routes.get('/', (request, response) => {
    const rooms = room_manager.all_rooms();
    const clients = Client.all_clients();

    const client_list = Object.keys(clients).map(key => clients[key].user.username);
    const room_list = Object.keys(rooms).map(key => {
        const are_playing = rooms[key].game ? true : false;
        return { key, are_playing }
    });

    return response.send({ client_list, room_list });
});

// Criar
// routes.post('/', controller.create);

export default routes;
