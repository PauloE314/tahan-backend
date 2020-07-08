import { Quizzes } from '@models/quiz/Quizzes';
import { getRepository, getCustomRepository } from 'typeorm';
import { SocketEvents, SocketErrors } from "@config/socket";
import { Socket, Server } from 'socket.io';
import { Err } from 'src/utils/classes';
import { APISocket, Room } from 'src/@types';
import JoinGame from './joinGame';
import { Games } from '@models/games/Games';
import GamesRepository from '@database/repositories/GamesRepo';
import joinGame from './joinGame';


interface StartGameInput {
    quizId: number,
    gameMode: 'single' | 'multi',
    time: boolean,
    timeToNextQuestion: boolean
};

export default async function createGame (io: Server, socket: APISocket, data: StartGameInput){
    const { quizId, gameMode, time, timeToNextQuestion } = data;
    try {
        // Tenta pegar o quiz
        const quiz = await getRepository(Quizzes).findOne({
            relations: ["questions", 'questions.alternatives', "questions.rightAnswer", "author"],
            where: { id: quizId }
        });
        // Se o quiz não existir, reporta isso
        if (!quiz)
            return socket.emit(SocketErrors.InvalidData, { name: 'quiz', message: 'Esse quiz não existe' });

        // Checa se o modo de jogo é válido
        if (gameMode !== 'multi' && gameMode !== 'single')
            return socket.emit(SocketErrors.InvalidData, { name: 'gameMode', message: 'O modo de jogo deve ser "single" ou "multi"' });

        // Checa se o tempo é válido
        if (time == undefined)
            return socket.emit(SocketErrors.InvalidData, { name: 'time', message: 'Envie um "time" válido' });

        // Checa se o tempo é válido
        if (timeToNextQuestion == undefined)
            return socket.emit(SocketErrors.InvalidData, { name: 'timeToNextQuestion', message: 'Envie um "timeToNextQuestion" válido' });

        delete quiz.questions;

        // Cria uma sala
        const room_name = `quiz-${data.quizId}-${Object.keys(socket.rooms)[0]}`;
        socket.client.room = room_name;
        socket.join(room_name);
        const room = <Room>io.sockets.adapter.rooms[room_name];
        // Armazena os dados na sala
        room.quiz = quiz;
        room.players = [];
        // Faz o usuário que criou o game dar Join
        await joinGame(io, socket, room_name);
    }
    catch(err) {
        console.log(err.message);
    }

}
