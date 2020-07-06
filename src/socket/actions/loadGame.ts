import { Quizzes } from '@models/quiz/Quizzes';
import { getRepository } from 'typeorm';
import { SocketEvents, SocketErrors } from "@config/socket";
import { Socket } from 'socket.io';
import { Err } from 'src/utils/classes';
import { APISocket } from 'src/@types';

interface StartGameInput {
    quizId: number,
    gameMode: 'single' | 'multi',
    time: boolean,
    timeToNextQuestion: boolean
};

export default async function LoadGame (socket: APISocket, data: StartGameInput){
    const { quizId, gameMode, time, timeToNextQuestion } = data;
    try {
        // Tenta pegar o quiz
        const quiz = await getRepository(Quizzes).findOne({
            relations: ["questions", 'questions.alternatives', "questions.rightAnswer", "author"],
            where: { id: quizId }
        });
        // Se o quiz não existir, reporta isso
        if (!quiz)
            return socket.emit(SocketErrors.QuizNotFound);

        // Envia os dados do quiz
        socket.client.quiz = Object.assign({}, quiz);
        socket.client.gameMode = gameMode;
        socket.client.time = time;
        socket.client.timeToNextQuestion = timeToNextQuestion;
        
        delete quiz.questions;

        socket.emit(SocketEvents.QuizData, quiz);
    }
    catch(err) {
        console.log(err.message);
    }

}
