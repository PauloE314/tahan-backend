import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { SocketEvents, GameExceptions } from "@config/socket";
import { clientIsInRoom, clientIsInGame } from "../helpers/validator";
import { messagePrint } from "src/utils";

/**
 * Ação que lida com as respostas dos usuários. É a função com a lógica central do funcionamento do jogo de quizzes multiplayer.
 */
export function answer(io: Server, client: SocketClient, data: any) {
    try {
        // Certifica que o usuário está em sala e em jogo
        const room = clientIsInRoom(client, true);
        const game = clientIsInGame(client, true);

        // Certifica que há uma questão pra responder
        if (game.state !== 'onQuestion')
            return client.emitError(GameExceptions.InvalidAction);
        
        // Certifica que o jogador ainda não respondeu a questão
        if(game.currentQuestion.playerAnswers[client.user.id].state)
            return client.emitError(GameExceptions.QuestionAlreadyAnswered);
            
        // Pega a resposta do usuário
        const answer = data ? data.id : -1;

        // Responde questão
        const answerState = game.answerQuestion(client, answer);

        // Notifica resposta do usuário
        client.emitToRoom(SocketEvents.PlayerAnswered, client.user);

        messagePrint(`[USUÁRIO RESPONDEU]: username: ${client.user.username}, gameId: ${client.roomId}, answer: ${answerState}`);

        // Checa se todos responderam
        if (game.allAnswered()) {
            // Restaura estado inicial de jogo
            game.state = 'onInterval';
            game.room.setAllNotReady();

            // Limpa temporizador
            game.timer.stopTimer();

            // Dados dos jogadores
            const turnScore = {
                playerAnswers: game.currentQuestion.playerAnswers,
                rightAnswer: game.currentQuestion.question.rightAnswer
            };

            // Avisa que todos responderam
            game.room.sendToAll(io, SocketEvents.EveryBodyAnswered, turnScore);   
            
            // Avança para próxima questão
            const nextQuestion = game.nextQuestion();

            // Caso não hajam mais questões, termina o jogo
            if (!nextQuestion)
                return game.endGame(io);
        }
        
        return;
    
    // Lida com possíveis erros
    } catch (error) {
        if (error.name !== SocketEvents.GameError)
            throw error;
    }
}