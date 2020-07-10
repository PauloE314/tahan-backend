import { Quizzes } from '@models/quiz/Quizzes';
import { getRepository, getCustomRepository } from 'typeorm';
import { SocketEvents, GameErrors } from "@config/socket";
import { Socket, Server } from 'socket.io';
import { Err } from 'src/utils/classes';
import { APISocket, Room } from 'src/@types';
// import JoinGame from './'
import { Games } from '@models/games/Games';
import GamesRepository from '@database/repositories/GamesRepo';
import Client from '../helpers/client';
import Match from '../helpers/match';
import GameQuiz from '../helpers/game';
import { count_runner } from '../../utils';

// Adiciona o usuário à sala passada como parâmetro
export default async function StartGame (io: Server, client: Client, data: { quiz_id: number }) {
    // Checa se o usuário está em um jogo
    if (!client.match_code)
        return client.emitError(GameErrors.UserNotInGame)
    
    const match = Match.get_match(client.match_code);
    // Checa se o match já tem os dois jogadores
    if (!match.all_ready(io))
        return client.emitError(GameErrors.RoomIncomplete);

    // Pega o quiz
    const quiz = await getRepository(Quizzes).findOne({
        relations: ['author', 'section', 'questions', 'questions.alternatives', 'questions.rightAnswer'],
        where: { id: data.quiz_id }
    });

    // Certifica que o quiz existe
    if (!quiz)
        return client.emitError(GameErrors.QuizDoesNotExist);

    // Cria o jogo
    const game = new GameQuiz(match, quiz);

    // Envia dados de jogo
    io.to(game.room_key).emit(SocketEvents.GameData, {
        id: game.quiz.id,
        name: game.quiz.name,
        author: game.quiz.author,
        created_at: game.quiz.created_at,
        section: game.quiz.section
    })

    // Contagem para iniciar o jogo
    count_runner(5, (stopTimmer, counter) => {
            io.to(game.room_key).emit(SocketEvents.GameStartCounter, counter);
        },
        () => {
            // Manda envia os dados da primeira questão
            const next_question_data = game.nextQuestion();
            io.to(game.room_key).emit(SocketEvents.NextQuestion, next_question_data);
        }
    );
}
