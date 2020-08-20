import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { GameExceptions, SocketEvents } from "@config/socket";
import { Game } from "../helpers/games";

/**
 * Ação que permite o início do jogo na aplicação. Os jogos são voláteis e armazenam estados úteis dos jogadores, suas pontuações e validam suas respostas, etc.
 */
export function startGame(io: Server, client: SocketClient, data?: any) {
    const { room } = client;

    // Certifica que o cliente está em uma sala
    if (!room)
        return client.emitError(GameExceptions.RoomDoesNotExist);

    // Certifica que o cliente é o cliente principal
    if (room.mainClient.user.id !== client.user.id)
        return client.emitError(GameExceptions.PermissionDenied);

    // Certifica que o cliente não está em jogo
    if (client.inGame)
        return client.emitError(GameExceptions.UserAlreadyInGame);

    // Certifica que há pelo menos 2 jogadores
    if (room.clients.length < 2)
        return client.emitError(GameExceptions.RoomIncomplete);

    // Cria o jogo
    const game = new Game(room);

    // Avisa aos jogadores que o jogo foi criado
    return room.sendToAll(io, SocketEvents.GameStart);
}