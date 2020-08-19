import { SocketClient } from "../helpers/clients";
import { Server } from "socket.io";
import { GameExceptions } from "@config/socket";
import { messagePrint } from "src/utils";
import { Room } from "../helpers/rooms";

/**
 * Ação que permite o jogador sair de uma sala de jogo. O resultado dessa ação é semelhante à desconexão.
 */
export async function leaveRoom(io: Server, client: SocketClient, data?: any) {
    const { room } = client;

    // Certifica que a sala existe
    if (!room) {
        messagePrint(`[ERRO AO SAIR DE SALA]: usuário: ${client.user.username}`);
        return client.emitError(GameExceptions.RoomDoesNotExist);
    }

    // Mensagem
    messagePrint(`[USUÁRIO SAINDO DE SALA]: id: ${room.id}, total de usuários da sala: ${Object.keys(room.players.length)}, total de salas: ${Object.keys(Room.rooms).length}`);

    // Retira o usuário da sala
    await room.clientLeaveRoom(client, io);
}