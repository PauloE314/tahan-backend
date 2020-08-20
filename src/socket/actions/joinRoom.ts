import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { GameExceptions, SocketEvents } from "@config/socket";
import { IJoinRoomInput } from "src/@types/socket";
import { Room } from "../helpers/rooms";
import { messagePrint } from "src/utils";

/**
 * Ação que permite um usuário entrar em uma sala de jogo. Existe uma hierarquia entre os jogadores que entram na sala, de forma com que, caso o jogador principal saia do jogo, o jogador principal se torna o que entrou na sala logo após ele.
 */
export async function joinRoom(io: Server, client: SocketClient, data?: IJoinRoomInput) {
    const code = data ? data.room_id : null;
    
    // Certifica que o jogador não está em outra sala
    if (client.inRoom)
        return client.emitError(GameExceptions.UserAlreadyInRoom);

    // Certifica que existe uma sala com esse id
    const room = Room.getRoom(code);
    if (!room)
        return client.emitError(GameExceptions.RoomDoesNotExist);

    // Certifica que a sala ainda não está cheia
    if (room.clients.length > 1)
        return client.emitError(GameExceptions.RoomIsFull);
 
    // Adiciona o jogador à sala
    room.addClient(io, client);
    
    // Avisa ao usuário
    client.emit(SocketEvents.RoomJoined);

    // Avisa aos demais usuários
    client.emitToRoom(SocketEvents.PlayerJoin, client.user);

    // Mensagem
    messagePrint(`[USUÁRIO ENTROU EM SALA]: username: ${client.user.username}, roomId: ${room.id}, total de clientes na sala: ${room.clients.length}`);
}