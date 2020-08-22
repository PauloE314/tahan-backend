import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { clientIsInGame, clientIsInRoom, clientIsMainPlayer } from "../helpers/validator";
import { SocketEvents, GameExceptions } from "@config/socket";

/**
 * Ação que permite o jogador ir para a próxima questão do quiz. Essa ação só é permitida quando todos os jogadores estiverem prontos.
 */
export async function nextQuestion(io: Server, client: SocketClient, data?: any) {
    try {        
        // Certifica que o jogador que está realizando essa requisição é válido
        const room = clientIsInRoom(client, true);
        const game = clientIsInGame(client, true);
        const isMainPlayer = clientIsMainPlayer(client, room);
    
        // Certifica que não estão em questão
        if (game.state === 'onQuestion')
            return client.emitError(GameExceptions.InvalidAction);
    
        // Certifica que todos estão prontos
        if (!game.room.allReady())
            return client.emitError(GameExceptions.NotAllReady);
    
        // Pega dados da questão
        const questionData = game.getSafeQuestionData();
        game.state = 'onQuestion';
    
        // Envia os dados da questão para todos os players
        game.room.sendToAll(io, SocketEvents.QuestionData, questionData);
    
        // Inicia contador
        game.timer.countRunner({
            times: 30,
            execute: (game, count) => {
                // Envia mensagem de tempo para todos da sala
                game.room.sendToAll(io, SocketEvents.GameTimer, { count });
            },
            onTimeOver: (game) => {
                // Restaura estado inicial de jogo
                game.state = 'onInterval';
                game.room.setAllNotReady();
    
                // Dados dos jogadores
                const turnScore = {
                    playerAnswers: game.currentQuestion.playerAnswers,
                    rightAnswer: game.currentQuestion.question.rightAnswer
                };
    
                // Envia mensagem de tempo acabado
                game.room.sendToAll(io, SocketEvents.TimeOut, turnScore);

                // Avança para próxima questão
                const nextQuestion = game.nextQuestion();

                // Caso não hajam mais questões, termina o jogo
                if (!nextQuestion)
                    return game.endGame(io);
            }
        })
    // Lida com possíveis erros
    } catch (error) {
        if (error.name !== SocketEvents.GameError)
            throw error;
    }
}
