import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { SocketEvents, GameExceptions } from "@config/socket";
import { messagePrint } from "src/utils";

/**
 * Ação que permite o jogador afirmar que está pronto para os demais jogadores da sala.
 */
export function ready(io: Server, client: SocketClient, data?: any) {
    try {
        // Aplica validação de prontidão
        const { room } = readyValidation(io, client, data);

        // Mensagem
        messagePrint(`[USUÁRIO PRONTO]: username: ${client.user.username}, roomId: ${room.id}, total de clientes na sala: ${room.clientList.length}`);

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

/**
 * Aplica a validação de prontidão
 */
function readyValidation(io: Server, client: SocketClient, data?: any) {
    const { room } = client;

    // Certifica que o cliente está em uma sala
    if (!room)
        client.emitError(GameExceptions.RoomDoesNotExist).raise();

    // Certifica que a questão não está rodando
    if (client.inGame)
        if (client.room.game.state !== 'onInterval')
            client.emitError(GameExceptions.InvalidAction).raise();

    return { room };
}