import { Quizzes } from '@models/quiz/Quizzes';
import { getRepository, getCustomRepository } from 'typeorm';
import { SocketEvents, GameErrors } from "@config/socket";
import { Socket, Server } from 'socket.io';
import { Err } from 'src/utils/classes';
// import JoinGame from './'
import { Games } from '@models/games/Games';
import GamesRepository from '@database/repositories/GamesRepo';
import Client from '../helpers/client';
import Match from '../helpers/match';
import GameQuiz from '../helpers/game';
import { count_runner } from '../../utils';
import { StartGameData, GameData, GameCountData } from 'src/@types/socket';

// Adiciona o usuário à sala passada como parâmetro
export default async function StartGame (io: Server, client: Client, data: StartGameData) {
    // Checa se o usuário está em um jogo
    if (!client.match_code)
        return client.emitError(GameErrors.UserNotInMatch);
    
    const match = Match.get_match(client.match_code);
    // Checa se o match já tem os dois jogadores
    if (!match.all_ready(io))
        return client.emitError(GameErrors.RoomIncomplete);

    // Checa se o match está em jogo ou não
    if (match.room.game) 
        return client.emitError(GameErrors.UserAlreadyInGame);

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

    // Pega dados do jogo
    const game_data: GameData = {
        id: game.quiz.id,
        name: game.quiz.name,
        author: game.quiz.author,
        created_at: game.quiz.created_at,
        section: game.quiz.section
    }

    // Envia dados de jogo
    io.to(game.room_key).emit(SocketEvents.GameData, game_data)

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
