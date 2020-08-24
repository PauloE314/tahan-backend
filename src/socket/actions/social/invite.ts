import { Server } from "socket.io";
import { SocketClient } from "src/socket/entities/clients";
import { GameExceptions, SocketEvents } from "@config/socket";
import { getCustomRepository } from "typeorm";
import { FriendsRepository } from "@controllers/friends/friendsRepository";

/**
 * Ação que permite o usuário enviar uma solicitação para entrar na sala dele para outro usuário.
 */
export async function invite(io: Server, client: SocketClient, data?: any) {
    try {
        const { receiver, room } = await inviteValidation(io, client, data);
    
        // Envia id da sala para o usuário
        return receiver.emit(SocketEvents.RoomInvite, { room_id: room.id, user: client.user });

    // Lida com erros
    } catch (error) {
        if (error.name !== SocketEvents.GameError)
            throw error;

        return;
    }
}

/**
 * Valida o envio de convites de usuários
 */
async function inviteValidation(io: Server, client: SocketClient, data?: any) {
    const { room } = client;
    const friendsRepo = getCustomRepository(FriendsRepository);
    const friendId = data ? data.friend_id: null;

    // Certifica que o cliente está em uma sala
    if (!room)
        client.emitError(GameExceptions.RoomDoesNotExist).raise();

    // Certifica que o cliente é o cliente principal da sala
    if (room.mainClient.user.id !== client.user.id)
        client.emitError(GameExceptions.PermissionDenied).raise();

    // Certifica que ainda não estão em jogo
    if (client.inGame)
        client.emitError(GameExceptions.InvalidAction).raise();

    // Certifica que o usuário está online
    const receiver = SocketClient.getClient(friendId);
    if (!receiver)
        client.emitError(GameExceptions.UserDoesNotExist).raise();

    // Certifica que o usuário é amigo do cliente
    const isFriend = await friendsRepo.areFriends([client.user, receiver.user]);
    if (!isFriend)
        client.emitError(GameExceptions.NotFriends).raise();


    return { receiver, room }
}