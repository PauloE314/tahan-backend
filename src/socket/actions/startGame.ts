import { Quizzes } from '@models/quiz/Quizzes';
import { getRepository } from 'typeorm';
import { SocketEvents, SocketErrors } from "@config/socket";
import { Socket } from 'socket.io';
import { Err } from 'src/utils/classes';
import { APISocket } from 'src/@types';
import { get_question } from 'src/utils';


export default async function StartGame (socket: APISocket, data: any) {
    // const {  }
    try {
        // Envia os dados da questão para o cliente
        if (socket.client.gameMode == 'single' && !socket.client.time) {
            socket.client.answered_questions = [];

            const { quiz } = socket.client;
            const { question, returning_question} = get_question(quiz, []);
            
            socket.client.question = question;
            socket.emit(SocketEvents.NextQuestion, returning_question);
        }
    }
    catch(err) {
        console.log(err.message);
    }
}
