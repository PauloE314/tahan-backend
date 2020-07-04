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
        
    if (socket.client.gameMode == 'single' && !socket.client.time) {
        
        const { quiz, answered_questions } = socket.client;
        const question = get_question(quiz, answered_questions);
        socket.emit(SocketEvents.NextQuestion, question);
    }
    }
    catch(err) {
        console.log(err.message);
    }
}
