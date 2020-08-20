import { Router } from 'express';
import { Room } from 'src/socket/helpers/rooms';
import { SocketClient } from 'src/socket/helpers/clients';

const routes = Router({ mergeParams: true });

// Leitura
routes.get('/', (request, response) => {
    const rooms = Room.rooms;
    const clients = SocketClient.clients;

    const clientList = Object.keys(clients).map(key => clients[key].user);
    const roomList = Object.keys(rooms).map(key => {
        const room = rooms[key];

        return {
            id: room.id,
            clients: room.clients.map(client => client.user.username),
            arePlaying: room.game ? true : false,
            quiz: room.quiz
        }
    });

    return response.send({ clients: clientList, rooms: roomList });
});

// Criar
// routes.post('/', controller.create);

export default routes;
