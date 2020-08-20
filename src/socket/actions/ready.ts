import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { GameExceptions, SocketEvents } from "@config/socket";

/**
 * Ação que permite o jogador afirmar que está pronto para os demais jogadores da sala
 */
export function ready(io: Server, client: SocketClient, data?: any) {
    const { room } = client;

    // Checa se o usuário está em sala
    if (!room)
        client.emitError(GameExceptions.RoomDoesNotExist);
    
    // Avisa a todos da sala
    return client.emitToRoom(SocketEvents.PlayerReady, client.user);
}