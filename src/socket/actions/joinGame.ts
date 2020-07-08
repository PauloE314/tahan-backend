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
export default async function JoinGame (io: Server, socket: APISocket, data: string){
    const room_name = data;
    const is_user_in_another_room = Object.keys(socket.rooms).filter(room => room.startsWith('quiz-')).length;
    // Assegura que o usuário não está em outro jogo
    if (is_user_in_another_room) 
        return socket.emit(SocketErrors.DoubleGame, { name: 'Jogo duplo', message: 'O usuário está participando de outro jogo nesse momento'});

    // Checa se a sala realmente existe
    const all_rooms = io.sockets.adapter.rooms;
    const room = <Room>all_rooms[room_name];
    if (!room)
        return socket.emit(SocketErrors.RoomNotExists, { name: 'Sala não existe', message: 'Essa sala não existe'});
    // Adiciona o usuário à sala
    socket.join(room_name);
    socket.client.room = room_name;
    // 
    room.players.push({ id: socket.client.user.info.id, isReady: false })
    // Retorna os dados do quiz
    const quiz = room.quiz;
    return socket.emit(SocketEvents.GameData, { quiz, room_name });

    // Pega os dados da salla

    // Avisa aos outros usuários da sala
    socket.broadcast.in(room_name).emit("match", 'OPONENTE À VISTA');

}
