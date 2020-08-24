import { Router } from 'express';
import { Room } from 'src/socket/entities/rooms';
import { SocketClient } from 'src/socket/entities/clients';
import { Game } from 'src/socket/entities/games';

const routes = Router({ mergeParams: true });

// Leitura
routes.get('/', (request, response) => {
    const rooms = Room.rooms;
    const games = Game.games;
    const clients = SocketClient.clients;

    const clientList = Object.keys(clients).map(key => clients[key].user);
    const roomList = Object.keys(rooms).map(key => {
        const room = rooms[key];
        const quiz = room.quiz ? { id: room.quiz.id, name: room.quiz.name } : undefined;

        return {
            id: room.id,
            clients: room.clientList.map(client => client.user.username),
            mainClient: room.mainClient.user.username,
            arePlaying: room.game ? true : false,
            quiz
        }
    });

    const gameList = Object.keys(games).map(key => ({
        id: games[key].roomId,
        quizId: games[key].quiz.id,
        currentQuestion: games[key].currentQuestion
    }));

    return response.send({ clients: clientList, rooms: roomList, games: gameList });
});

// Criar
// routes.post('/', controller.create);

export default routes;
