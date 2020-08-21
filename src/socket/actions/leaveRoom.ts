import { SocketClient } from "../helpers/clients";
import { Server } from "socket.io";
import { clientIsInRoom } from "../helpers/validator";
import { SocketEvents } from "@config/socket";

/**
 * Ação que permite o jogador sair de uma sala de jogo. O resultado dessa ação é semelhante à desconexão, entretanto, não apaga o registro do usuário dos usuários online.
 */
export async function leaveRoom(io: Server, client: SocketClient, data?: any) {
    try {
        // Certifica que a sala existe
        const room = clientIsInRoom(client, true);

        // Retira o usuário da sala
        await room.clientLeaveRoom(io, client);
    
    // Certifica que não ocorram erros
    } catch (error) {
        if (error.name !== SocketEvents.GameError)
            throw error;
    }
}