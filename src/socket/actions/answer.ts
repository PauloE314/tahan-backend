import { Quizzes } from '@models/quiz/Quizzes';
import { getRepository } from 'typeorm';
import { SocketEvents, GameErrors } from "@config/socket";
import { Socket, Server } from 'socket.io';
import Client from '../helpers/client';
import GameQuiz from '../helpers/game';
import { count_runner } from '../../utils';
import { AnswerData, GameData, GameCountData, BothAnsweredData } from 'src/@types/socket';
import next_question from './nextQuestion';

// Adiciona o usuário à sala passada como parâmetro
export default async function Answer (io: Server, client: Client, data: AnswerData ) {
    // Checa se o usuário está uma sala
    if (!client.room_key)
        return client.emitError(GameErrors.UserNotInMatch);
        
    const game = GameQuiz.get_game(client.room_key);

    // Checa o jogo existe ou não
    if (!game) 
        return client.emitError(GameErrors.GameDoesNotExist);

    // Avisa ao oponente que o jogador respondeu
    const oponent = game.room.match.players.find(player => player.user.id !== client.user.id);
    oponent.emit(SocketEvents.OponentAnswered);

    // responde o jogo
    game.answerQuestion(client, data.answer_id, ({ player1_answer, player2_answer }) => {
        const both_answered_data: BothAnsweredData = {
            player1_answer, player2_answer
        };
        io.to(game.room_key).emit(SocketEvents.BothAnswered, both_answered_data);
        // Retorna a próxima questão
        return next_question(game);
    });

    // Contagem para iniciar o jogo
    count_runner({
        times: 5,
        execute: (counter, stopTimmer) => {
            const time_data: GameCountData = { count: counter }
            io.to(game.room_key).emit(SocketEvents.GameStartCounter, time_data);
        },
        // Quando a contagem acabar
        on_time_over: () => {
            // Manda envia os dados da primeira questão
            const next_question_data = game.nextQuestion();
            io.to(game.room_key).emit(SocketEvents.NextQuestion, next_question_data);
        }
    })
}
