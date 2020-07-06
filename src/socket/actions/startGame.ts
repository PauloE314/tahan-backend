import { Quizzes } from '@models/quiz/Quizzes';
import { getRepository } from 'typeorm';
import { SocketEvents, SocketErrors } from "@config/socket";
import { Socket } from 'socket.io';
import { Err } from 'src/utils/classes';
import { APISocket } from 'src/@types';
import { get_question } from 'src/utils';
import { nextQuestion } from './handleAnswer';


export default async function StartGame (socket: APISocket, data: any) {
    // const {  }
    try {
        // Envia os dados da questão para o cliente
        if (socket.client.gameMode == 'single' && !socket.client.time) {
            socket.client.answered_questions = [];
            return nextQuestion(socket);
        }
    }
    catch(err) {
        console.log(err.message);
    }
}
