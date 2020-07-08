import { Quizzes } from '@models/quiz/Quizzes';
import { getRepository, getCustomRepository } from 'typeorm';
import { SocketEvents, SocketErrors } from "@config/socket";
import { Socket, Server } from 'socket.io';
import { Err } from 'src/utils/classes';
import { APISocket, Room } from 'src/@types';
// import JoinGame from './'
import { Games } from '@models/games/Games';
import GamesRepository from '@database/repositories/GamesRepo';

// Adiciona o usuário à sala passada como parâmetro
export default async function Ready (io: Server, socket: APISocket, data: string){
    const room = <Room>io.sockets.adapter.rooms[socket.client.room];
    // Seta o usuário como pronto
    room.players = room.players.map(player => {
        if (player.id == socket.client.user.info.id)
            player.isReady = true;
        return player
    });
    // Checa se todos os Usuários estão prontos
    const is_all_ready = !room.players.filter(player => !player.isReady).length;
    // Se todos estiverem, avisa a todos da sala
    if (is_all_ready)
        io.to(socket.client.room).emit('all-ready');
}
