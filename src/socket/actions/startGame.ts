import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { GameExceptions, SocketEvents } from "@config/socket";
import { Game } from "../helpers/games";
import { clientIsInRoom, clientIsMainPlayer, clientIsInGame } from "../helpers/validator";
import { nextQuestion } from "./nextQuestion";

/**
 * Ação que permite o início do jogo na aplicação. Os jogos são voláteis e armazenam estados úteis dos jogadores, suas pontuações e validam suas respostas, etc.
 */
export function startGame(io: Server, client: SocketClient, data?: any) {
    try {
        // Certifica que o cliente está em uma sala, é o principal e não está em jogo
        const room = clientIsInRoom(client, true);
        clientIsMainPlayer(client, room);
        clientIsInGame(client, false);

        // Certifica que o qui já foi escolhido
        if (!room.quiz)
            return client.emitError(GameExceptions.QuizDoesNotExist);

        // Certifica que há pelo menos 2 jogadores
        if (room.clients.length < 2)
            return client.emitError(GameExceptions.RoomIncomplete);

        // Certifica que todos estão prontos
        if (!room.allReady())
            return client.emitError(GameExceptions.NotAllReady);

        // Cria o jogo
        new Game(room);

        // Próxima questão (no caso, a primeira)
        nextQuestion(io, client, data);

    // Lida com possíveis erros
    } catch(error) {
        if (error.name !== SocketEvents.GameError)
            throw error;
    }
}