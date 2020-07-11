import { Quizzes } from '@models/quiz/Quizzes';
import { getRepository } from 'typeorm';
import { SocketEvents, GameErrors } from "@config/socket";
import { Socket, Server } from 'socket.io';
import Client from '../helpers/client';
import Match from '../helpers/match';
import GameQuiz from '../helpers/game';
import rooms_manager from '../helpers/rooms';
import { count_runner } from '../../utils';
import { StartGameData, GameData, GameCountData } from 'src/@types/socket';
import next_question from './nextQuestion';

// Adiciona o usuário à sala passada como parâmetro
export default async function StartGame (io: Server, client: Client, data: StartGameData) {
    // Checa se o usuário está em um jogo
    if (!client.room_key)
        return client.emitError(GameErrors.UserNotInMatch);
    
    const match = Match.get_match(client.room_key);
    // Checa se o match já tem os dois jogadores
    if (!match.all_ready(io))
        return client.emitError(GameErrors.RoomIncomplete);

    // Checa se o match está em jogo ou não
    if (match.room.game) {
        return client.emitError(GameErrors.UserAlreadyInGame);
    }

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
    io.to(game.room_key).emit(SocketEvents.GameData, game_data);
    const { players } = match;
    // const { room_key } = game;
    // Quando um dos jogadores for desconectado
    players.forEach(player => 
        player.on(SocketEvents.ClientDisconnected, () => {
            if (!player.room_key)
                return;
            // Certifica que o jogo ainda existe
            const game = GameQuiz.get_game(player.room_key);
            if (!game)
                return;
            // Avisa ao oponente que o jogador saiu
            const oponent = game.room.match.players.find(p => p.user.id !== player.user.id);
            io.to(game.room_key).emit(SocketEvents.OponentOut);
            // Para qualquer temporizador
            game.timmer.stop_timmer();
            const data = game.endGame({ forced_winner: oponent});
            // Envia o fim do jogo
            io.to(game.room_key).emit(SocketEvents.EndGame, data);

            // Caso o desconectado seja o player 1
            if (player.user.id === game.room.match.player_1.user.id) {
                // Termina o match
                oponent.emit(SocketEvents.MainPlayerOut)
                game.room.match.end_match(io);
            }
            // Caso seja o player 2, termina apenas o game
            else {
                oponent.emit(SocketEvents.SecondaryPlayerOut);
                rooms_manager.delete_game(game.room_key);
            }
        })
    )
    // Contagem para iniciar o jogo
    count_runner({
        times: 5,
        execute: (counter, stopTimmer) => {
            const time_data: GameCountData = { count: counter };
            io.to(game.room_key).emit(SocketEvents.GameStartCounter, time_data);
        },
        // Quando a contagem acabar
        on_time_over: () => {
            game.startGame();
            return next_question(io, game.room_key);
        }
    })
}
