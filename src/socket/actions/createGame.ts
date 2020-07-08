import { Quizzes } from '@models/quiz/Quizzes';
import { getRepository, getCustomRepository } from 'typeorm';
import { SocketEvents, GameErrors } from "@config/socket";
import { Socket, Server } from 'socket.io';
import { Err } from 'src/utils/classes';
import { APISocket, Room } from 'src/@types';
import { Games } from '@models/games/Games';
import Client from '../helpers/client';
import { getFullQuizData } from '../helpers/game'



export default async function createGame (io: Server, client: Client, data: number){
    // Cria um "game"
    const quiz = await getFullQuizData(data);
    // Caso não exista um quiz, emite um erro
    if (!quiz)
        return client.emitError(GameErrors.QuizDoesNotExist);

    // Caso o usuário já esteja em um jogo
    if (client.room_code)
        return client.emitError(GameErrors.UserAlreadyInGame);

    // Cria o jogo
    const room_name = 'game-' + data + client.socket.id;
    client.joinNewRoom(room_name);
    
}
