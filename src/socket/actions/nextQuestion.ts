import GameQuiz, { GameEndStatus } from "../helpers/game";
import { count_runner } from '../../utils';
import { Server } from "socket.io";
import { SocketEvents, GameStates } from "@config/socket";
import { GameCountData, EndGameData, BothAnsweredData } from "src/@types/socket";
import { Questions } from "@models/quiz/Questions";
import rooms_manager from "../helpers/rooms";
import { PlayerScore } from "@models/games/PlayerScore";
import { GameHistoric } from "@models/games/GameHistoric";
import { getRepository } from "typeorm";



export default function next_question(io: Server, game_id: string, count_start?: boolean) {
    const game = GameQuiz.get_game(game_id);
    // Caso o jogo não exista mais, para a função
    if (!game)
        return;

    const game_data = game.nextQuestion();
    // Caso o jogo esteja para terminar
    if (game.game_state === GameStates.BeforeEnd) {
        // Envia o término do jogo para os jogadores
        const { draw, winner } = game.endGame();
        const end_game_data: EndGameData = { draw, winner: winner ? winner : null };
        
        // Envia os dados de fim de jogo
        io.to(game.room_key).emit(SocketEvents.EndGame, end_game_data);

        // Salva o histórico do jogo
        if (end_game_data) {
            console.log('Iniciando salvamento no DB...');
            const answered_questions = game.game_questions.filter(game_question => game_question.answered);

            // Cria um score do jogador 1
            const p1_score = new PlayerScore();
            p1_score.score = answered_questions.filter(question => question.player_1 === 'right').length / answered_questions.length;
            p1_score.player = game.room.match.player_1.user;
            
            // Cria score do player 2
            const p2_score = new PlayerScore();
            p2_score.score = answered_questions.filter(question => question.player_2 === 'right').length / answered_questions.length;
            p2_score.player = game.room.match.player_2.user;
            
            // Cria o histórico do jogo
            const game_historic = new GameHistoric();
            game_historic.is_multiplayer = true;
            game_historic.player_1_score = p1_score;
            game_historic.player_2_score = p2_score;
            game_historic.quiz = game.quiz;
            
            // Salva o histórico
            getRepository(GameHistoric).save(game_historic).then(() => {
                game.delete_game();
            })
        }
        else
            game.delete_game();

        return;
    }
    // Caso não haja nenhum dado sendo retornado
    if (!game_data)
        return;
    // Envia a próxima questão para os jogadores
    io.to(game.room_key).emit(SocketEvents.NextQuestion, game_data);
    // Inicia contador

    game.timmer.start_count_runner({
        times: 30,
        // Envia a contagem do jogo
        execute: (counter, stopTimmer) => {
            const data: GameCountData = { count: counter };
            io.to(game.room_key).emit(SocketEvents.AnswerCounter, data);
        },
        // Quando o tempo acabar, avisa e responde como errado quem não respondeu ainda
        on_time_over: () => {
            // Avisa que o tempo acabou
            io.to(game.room_key).emit(SocketEvents.TimeOut);
            const index = game.current_question_index;
            const { player_1, player_2 } = game.current_question;
            const both_answered_data: BothAnsweredData = {
                player1_answer: player_1,
                player2_answer: player_2
            }
            // Caso o jogador 1 não tenha respondido
            if (!player_1) {
                game.game_questions[index].player_1 = 'wrong';
                both_answered_data.player1_answer = 'no-answer';
            }
            // Caso o jogador 2 não tenha respondido
            if (!player_2) {
                game.game_questions[index].player_2 = 'wrong';
                both_answered_data.player2_answer = 'no-answer';
            }
            io.to(game.room_key).emit(SocketEvents.BothAnswered, both_answered_data);

            return next_question(io, game.room_key);
        }
    });
}