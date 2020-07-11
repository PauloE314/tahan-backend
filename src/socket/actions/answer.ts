import { SocketEvents, GameErrors } from "@config/socket";
import { Socket, Server } from 'socket.io';
import Client from '../helpers/client';
import GameQuiz from '../helpers/game';
import { AnswerData, BothAnsweredData } from 'src/@types/socket';
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
    game.answerQuestion({
        client,
        answer_id: data.answer_id,
        on_answer: (player_answer) => {
            // Caso a resposta esteja correta
            if (player_answer == 'right')
                return client.emit(SocketEvents.RightAnswer);
            
            // Caso esteja errada
            return client.emit(SocketEvents.WrongAnswer);
        },
        on_both_answered: ({ player1_answer, player2_answer }) => {
            const both_answered_data: BothAnsweredData = {
                player1_answer, player2_answer
            };
            io.to(game.room_key).emit(SocketEvents.BothAnswered, both_answered_data);
            // Para o contador
            game.timmer.stop_timmer();
            // Retorna a próxima questão
            return next_question(io, game.room_key);
        }
    });
}
