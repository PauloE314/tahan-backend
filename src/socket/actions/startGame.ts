import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { GameExceptions, SocketEvents } from "@config/socket";
import { Game } from "../helpers/games";
import { clientIsInRoom, clientIsMainPlayer, clientIsInGame } from "../helpers/validator";

/**
 * Ação que permite o início do jogo na aplicação. Os jogos são voláteis e armazenam estados úteis dos jogadores, suas pontuações e validam suas respostas, etc.
 */
export function startGame(io: Server, client: SocketClient, data?: any) {
    try {
        // Certifica que o cliente está em uma sala, é o principal e não está em jogo
        const room = clientIsInRoom(client, true);
        const isMainPlayer = clientIsMainPlayer(client, room);
        const isInGame = clientIsInGame(client, false);

        // Certifica que há pelo menos 2 jogadores
        if (room.clients.length < 2)
            return client.emitError(GameExceptions.RoomIncomplete);

        // Cria o jogo
        const game = new Game(room);

        // Pega primeira questão
        const questionData = game.getSafeQuestionData();

        // Avisa aos jogadores que o jogo foi criado
        room.sendToAll(io, SocketEvents.GameStart, questionData);

        // Inicia contador
        game.timer.countRunner({
            times: 30,
            execute: (game, count) => {
                // Envia mensagem de tempo para todos da sala
                game.room.sendToAll(io, SocketEvents.GameTimer, { count });
            },
            onTimeOver: (game) => {
                // Envia mensagem de tempo acabado
                game.room.sendToAll(io, SocketEvents.TimeOut);
            }
        })

    // Lida com possíveis erros
    } catch(error) {
        if (error.name !== SocketEvents.GameError)
            throw error;
    }
}