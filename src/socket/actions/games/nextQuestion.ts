import { Server } from "socket.io";
import { SocketClient } from "../../helpers/clients";
import { SocketEvents, GameExceptions } from "@config/socket";

/**
 * Ação que permite o jogador ir para a próxima questão do quiz. Essa ação só é permitida quando todos os jogadores estiverem prontos.
 */
export async function nextQuestion(io: Server, client: SocketClient, data?: any) {
    try {
        // Aplica validação de ação
        const { game } = nextQuestionValidation(io, client, data);
    
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


/**
 * Validação de solicitação para a próxima questão do jogo
 */
function nextQuestionValidation(io: Server, client: SocketClient, data?: any) {
    const { room } = client;

    // Certifica que o cliente está na sala
    if (!room)
        client.emitError(GameExceptions.RoomDoesNotExist).raise();

    // Certifica que o cliente está em jogo
    const { game } = room;
    if (!game)
        client.emitError(GameExceptions.GameDoesNotExist).raise();

    // Certifica que o cliente é o jogador principal
    if (client.user.id !== room.mainClient.user.id)
        client.emitError(GameExceptions.PermissionDenied).raise();

    // Certifica que o estado do jogo é válido
    if (game.state !== 'onInterval')
        client.emitError(GameExceptions.InvalidAction).raise();

    // Certifica que todos estão prontos
    if (!room.allReady())
        client.emitError(GameExceptions.NotAllReady).raise();

    return { room, game };
}