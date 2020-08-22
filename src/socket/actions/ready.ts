import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { SocketEvents, GameExceptions } from "@config/socket";
import { messagePrint } from "src/utils";
import { clientIsInRoom } from "../helpers/validator";

/**
 * Ação que permite o jogador afirmar que está pronto para os demais jogadores da sala.
 */
export function ready(io: Server, client: SocketClient, data?: any) {
    try {
        // Certifica que a sala existe
        const room = clientIsInRoom(client, true);

        // Certifica que a questão não está rodando
        if (client.inGame)
            if (client.room.game.runningQuestion)
                return client.emitError(GameExceptions.InvalidAction);

        // Mensagem
        messagePrint(`[USUÁRIO PRONTO]: username: ${client.user.username}, roomId: ${room.id}, total de clientes na sala: ${room.clients.length}`);

        // Seta o usuário como pronto
        client.isReady = true;
        
        // Avisa a todos da sala
        return client.emitToRoom(SocketEvents.PlayerReady, client.user);

    // Lida com erros
    } catch(error) {
        if (error.name !== SocketEvents.GameError)
            throw error;
    }
}