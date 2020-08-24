import { Server } from "socket.io";
import { SocketClient } from "src/socket/entities/clients";
import { SocketEvents, GameExceptions } from "@config/socket";
import { joinRoom } from "../games/joinRoom";

/**
 * Ação que permite aceitar um convite de sala de jogo.
 */
export function acceptInvite(io: Server, client: SocketClient, data?: any) {
    try {
        const { sender, room } = acceptInviteValidation(io, client, data);

        // Envia mensagem para o destinatário
        sender.emit(SocketEvents.InviteAccept, { user: client.user });

        // Adiciona o usuário à sala
        return joinRoom(io, client, { room_id: room.id });
        
    // Lida com os possíveis erros
    } catch (error) {
        if (error.name !== SocketEvents.GameError)
            throw error;

        return;
    }
}

/**
 * Valida o aceitamento de um convite
 */
function acceptInviteValidation(io: Server, client: SocketClient, data?: any) {
    const senderId = data? data.sender_id : null;
    const roomId = data? data.room_id : null;

    // Certifica que o remetente existe
    const sender = SocketClient.getClient(senderId);
    if (!sender)
        client.emitError(GameExceptions.UserDoesNotExist).raise();

    // Certifica que a sala ainda é válida
    if (sender.roomId !== roomId || !sender.room)
        client.emitError(GameExceptions.RoomDoesNotExist).raise();


    return { sender, room: sender.room }
}