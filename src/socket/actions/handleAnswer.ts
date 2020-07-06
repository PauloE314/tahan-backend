import { Quizzes } from '@models/quiz/Quizzes';
import { getRepository } from 'typeorm';
import { SocketEvents, SocketErrors } from "@config/socket";
import { Socket } from 'socket.io';
import { Err } from 'src/utils/classes';
import { APISocket } from 'src/@types';
import { get_question } from 'src/utils';


export default async function HandleAnswer (socket: APISocket, data: any) {
    try {
    // Resposta do usuário
    const answer_id = data;
    // Resposta correta
    const right_answer = socket.client.question.rightAnswer;

    const right_answered = right_answer.id == answer_id;
    const { question, quiz, answered_questions, timeOnAnswer } = socket.client;
    
    
    // Checa se a questão já foi respondida - BUG
    const question_already_answered = answered_questions.filter(answer => answer.question_id == question.id).length;
    if (!question_already_answered) 
        // Armazena a questão como já jogada
        socket.client.answered_questions.push({ question_id: question.id, right_answered });
    
    // Retorna as respostas ao usuário
    if (right_answered)
        socket.emit(SocketEvents.RightAnswer);
    else
        socket.emit(SocketEvents.WrongAnswer);

    
    // Inicia a contagem para a próxima questão
    if (timeOnAnswer) {
        //pass
    }
    else {
        // Pega a próxima questão
        const next_question = get_question(quiz, answered_questions);
        // Caso não haja mais questões, o jogo acabou
        if (!next_question)
            return socket.emit(SocketEvents.EndGame, socket.client.answered_questions);
        // Caso o jogo ainda não tenha acabado, retorna os dados da próxima questão
        socket.client.question = next_question.question;
        return socket.emit(SocketEvents.NextQuestion, next_question.returning_question);
    }
    }
    catch(err) {
        console.log(err.message)
    }
}
