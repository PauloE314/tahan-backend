import { Quizzes } from '@models/quiz/Quizzes';
import { getRepository } from 'typeorm';
import { SocketEvents, SocketErrors } from "@config/socket";
import { Socket } from 'socket.io';
import { Err } from 'src/utils/classes';
import { APISocket } from 'src/@types';
import { get_question } from 'src/utils';
import configs from "@config/server"

const { time_to_next_question, time_to_answer } = configs.quizzes;

export default async function HandleAnswer (socket: APISocket, data: any) {
    // Limpa o contador

    // Resposta do usuário
    const answer_id = data;
    // Resposta correta
    const right_answer = socket.client.question.rightAnswer;

    const right_answered = right_answer.id == answer_id;
    const { question, answered_questions, timeToNextQuestion } = socket.client;
    
    
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
    if (timeToNextQuestion) {
        let counter = time_to_next_question;
        const timmer = setInterval(() => {
            // Quando a contagem zerar, envia a próxima questão
            if(counter == 0) {
                clearInterval(timmer);
                return nextQuestion(socket);
            }
            // Emite a contagem
            socket.emit(SocketEvents.TimerToNextQuestion, counter);
            counter--;
        }, 1000);
    }
    else
        return nextQuestion(socket);
}


export function nextQuestion(socket: APISocket, count = true) {
    const { quiz, answered_questions } = socket.client;
    // Pega a próxima questão
    const next_question = get_question(quiz, answered_questions);
    // Caso não haja mais questões, o jogo acabou
    if (!next_question)
        return socket.emit(SocketEvents.EndGame, socket.client.answered_questions);
    // Caso o jogo ainda não tenha acabado, retorna os dados da próxima questão
    socket.client.question = next_question.question;
    // Emite próxima questão
    socket.emit(SocketEvents.NextQuestion, next_question.returning_question);

    // Caso o usuário esteja jogando com tempo
    if (socket.client.time && count) {
        let counter = 10;

        const timmer = setInterval(() => {
            

            // Caso o contador chegue a 0, envia um erro            
            if (counter === 0) {
                clearInterval(timmer);
                // Tempo esgotado
                socket.emit(SocketEvents.TimeOut);
                // Considera a questão como incorreta
                const { question } = socket.client;
                const question_already_answered = answered_questions.filter(answer => answer.question_id == question.id).length;
                if (!question_already_answered) 
                    // Armazena a questão como já jogada
                    socket.client.answered_questions.push({ question_id: question.id, right_answered: false });
                // Próxima questão
                return nextQuestion(socket);
            }
            else {
                // emite a contagem
                socket.emit(SocketEvents.TimerToAnswer, counter);
            }
            counter--;
        },1000);

        // Caso alguém responda, para o timmer
        socket.on(SocketEvents.Answer, () => clearInterval(timmer));

        return;
    }
    return;
}