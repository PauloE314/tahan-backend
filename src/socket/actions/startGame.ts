import { Quizzes } from '@models/quiz/Quizzes';
import { getRepository } from 'typeorm';
import { SocketEvents, GameErrors } from "@config/socket";
import { Socket, Server } from 'socket.io';
import Client, { client_status } from '../helpers/client';
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
    io.to(game.room_key).emit(SocketEvents.GameData, game_data);
    const { players } = match;


    // Quando um dos jogadores for desconectado
    players.forEach(player => 
        player.on(SocketEvents.ClientDisconnected, () => {
            const game = GameQuiz.get_game(player.room_key);
            // Caso o jogo não exista mais
            if (!game)
                return;

            const room = rooms_manager.get_room(game.room_key);
            // Avisa ao oponente que o jogador saiu
            const oponent = game.room.match.players.find(p => p.user.id !== player.user.id);
            oponent.emit(SocketEvents.OponentOut);
            // Termina o jogo
            const data = game.endGame({ forced_winner: oponent});
            // Envia o fim do jogo
            oponent.emit(SocketEvents.EndGame, data);
            // Avisa que o oponente saiu
            oponent.emit(SocketEvents.OponentOut);

            // Caso o desconectado seja o player 1
            if (player.user.id === game.room.match.player_1.user.id) 
                // Deleta o match
                room.match.end_match(io);
            
            // Caso seja o player 2, termina apenas o game
            else 
                room.match.remove_player_2();
            
            // Apaga o jogo realmente
            game.delete_game();
        })
    );
    // Contagem para iniciar o jogo

    game.timmer.start_count_runner({
        times: 5,
        execute: (counter, stopTimmer) => {
            const time_data: GameCountData = { count: counter };
            io.to(game.room_key).emit(SocketEvents.GameStartCounter, time_data);
        },
        on_time_over: () => {
            game.startGame();
            return next_question(io, game.room_key);
        }
    });
}
