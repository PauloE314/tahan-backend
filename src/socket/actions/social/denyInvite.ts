import { SocketClient } from "src/socket/entities/clients";
import { SocketEvents, GameExceptions } from "@config/socket";
import { Server } from "socket.io";

/**
 * Ação que permite o usuário enviar uma mensagem de negar o convite
 */
export function denyInvite(io: Server, client: SocketClient, data?: any) {
    try {
        const { sender } = denyInviteValidation(io, client, data);

        // Envia mensagem para o destinatário
        return sender.emit(SocketEvents.InviteDeny, { user: client.user });
        
    // Lida com os possíveis erros
    } catch (error) {
        if (error.name !== SocketEvents.GameError)
            throw error;

        return;
    }
}

/**
 * Função que valida a negação de convites 
 */
function denyInviteValidation(io: Server, client: SocketClient, data?: any) {
    const senderId = data? data.sender_id : null;

    // Certifica que o remetente existe
    const sender = SocketClient.getClient(senderId);
    if (!sender)
        client.emitError(GameExceptions.UserDoesNotExist).raise();

    return { sender }
}