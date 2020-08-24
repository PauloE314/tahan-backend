import { Server } from "socket.io";
import { SocketClient } from "src/socket/entities/clients";
import { SocketEvents, GameExceptions } from "@config/socket";
import { messagePrint } from "src/utils";

/**
 * Ação que lida com as respostas dos usuários. É a função com a lógica central do funcionamento do jogo de quizzes multiplayer.
 */
export function answer(io: Server, client: SocketClient, data: any) {
    try {
        // Certifica que o usuário está em sala e em jogo
        const { room, game } = answerValidation(io, client, data);
            
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

/**
 * Valida a ação de responder uma questão
 */
function answerValidation(io: Server, client: SocketClient, data?: any) {
    const { room } = client;

    // Certifica que a sala existe
    if (!room)
        client.emitError(GameExceptions.RoomDoesNotExist).raise();

    // Certifica que o jogo está acontecendo
    const { game } = room;
    if (!game)
        client.emitError(GameExceptions.GameDoesNotExist).raise();

    // Certifica que o estado do jogo é válido
    if (game.state !== 'onQuestion')
        client.emitError(GameExceptions.InvalidAction).raise();

    // Certifica que o jogador ainda não respondeu
    if (game.currentQuestion.playerAnswers[client.user.id].state !== null) {
        client.emitError(GameExceptions.InvalidAction).raise();
    }


    return { game, room };
}