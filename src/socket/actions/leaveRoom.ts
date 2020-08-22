import { SocketClient } from "../helpers/clients";
import { Server } from "socket.io";
import { SocketEvents, GameExceptions } from "@config/socket";

/**
 * Ação que permite o jogador sair de uma sala de jogo. O resultado dessa ação é semelhante à desconexão, entretanto, não apaga o registro do usuário dos usuários online.
 */
export async function leaveRoom(io: Server, client: SocketClient, data?: any) {
    try {
        // Aplica validação de ação
        const { room } = leaveRoomValidation(io, client, data);

        // Retira o usuário da sala
        return await room.clientLeaveRoom(io, client);
    
    // Certifica que não ocorram erros
    } catch (error) {
        if (error.name !== SocketEvents.GameError)
            throw error;
    }
}

/**
 * Validação de saída de sala
 */
function leaveRoomValidation(io: Server, client: SocketClient, data?: any) {
    const { room } = client;

    // Certifica que a sala existe
    if (!room)
        client.emitError(GameExceptions.RoomDoesNotExist).raise();

    return { room };
}