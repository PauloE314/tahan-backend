import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { GameExceptions, SocketEvents } from "@config/socket";
import { Game } from "../helpers/games";
import { nextQuestion } from "./nextQuestion";

/**
 * Ação que permite o início do jogo na aplicação. Os jogos são voláteis e armazenam estados úteis dos jogadores, suas pontuações e validam suas respostas, etc.
 */
export function startGame(io: Server, client: SocketClient, data?: any) {
    try {
        // Aplica validação de ação
        const { room } = startGameValidation(io, client, data);
        
        // Cria o jogo
        const game = new Game(room);
        game.state = 'onInterval';

        // Próxima questão (no caso, a primeira)
        return nextQuestion(io, client, data);

    // Lida com possíveis erros
    } catch(error) {
        if (error.name !== SocketEvents.GameError)
            throw error;
    }
}

/**
 * Valida as ações de iniciação de jogo
 */
function startGameValidation(io: Server, client: SocketClient, data?: any) {
    const { room } = client;

    // Certifica que o cliente está em uma sala
    if (!room) 
        client.emitError(GameExceptions.RoomDoesNotExist).raise();

    // Certifica que ele não está em jogo
    if (client.inGame) 
        client.emitError(GameExceptions.UserAlreadyInGame).raise();

    // Certifica que é o cliente principal
    if (client.user.id !== room.mainClient.user.id) 
        client.emitError(GameExceptions.PermissionDenied).raise();

    // Certifica que o quiz já foi escolhido
    if (!room.quiz) 
        client.emitError(GameExceptions.QuizDoesNotExist).raise();

    // Certifica que há pelo menos 2 jogadores
    if (room.clientList.length < 2) 
        client.emitError(GameExceptions.RoomIncomplete).raise();

    // Certifica que todos estão prontos
    if (!room.allReady()) 
        client.emitError(GameExceptions.NotAllReady).raise();

    return { room };
}