import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { SocketEvents } from "@config/socket";
import { messagePrint } from "src/utils";
import { clientIsInRoom } from "../helpers/validator";

/**
 * Ação que permite o jogador afirmar que está pronto para os demais jogadores da sala. Essa feature não tem impacto nas regras de negócio da aplicação.
 */
export function ready(io: Server, client: SocketClient, data?: any) {
    try {
        // Certifica que a sala existe
        const room = clientIsInRoom(client, true);

        // Mensagem
        messagePrint(`[USUÁRIO PRONTO]: username: ${client.user.username}, roomId: ${room.id}, total de clientes na sala: ${room.clients.length}`);
        
        // Avisa a todos da sala
        return client.emitToRoom(SocketEvents.PlayerReady, client.user);

    // Lida com erros
    } catch(error) {
        if (error.name !== SocketEvents.GameError)
            throw error;
    }
}