import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { GameExceptions, SocketEvents } from "@config/socket";
import { Room } from "../helpers/rooms";
import { messagePrint } from "src/utils";

/**
 * Ação que permite um usuário entrar em uma sala de jogo. Existe uma hierarquia entre os jogadores que entram na sala, de forma com que, caso o jogador principal saia do jogo, o jogador principal se torna o que entrou na sala logo após ele.
 */
export async function joinRoom(io: Server, client: SocketClient, data?: any) {
    try {
        // Aplica validação de ação
        const { room } = joinRoomValidation(io, client, data);

        // Dados da sala
        const roomData: any = {
            users: room.clientList.map(player => player.user)
        };
    
        // Adiciona o jogador à sala
        room.addClient(io, client);

        // Avisa aos demais usuários
        client.emitToRoom(SocketEvents.PlayerJoin, client.user);

        // Checa se já foi escolhido o quiz
        if (room.quiz) {
            const { questions, ...safeData } = room.quiz;

            // Envia dados do quiz
            roomData.quiz = safeData;
        }

        // Envia os dados da sala para o usuário
        client.emit(SocketEvents.RoomJoined, roomData);

        // Mensagem
        messagePrint(`[USUÁRIO ENTROU EM SALA]: username: ${client.user.username}, roomId: ${room.id}, total de clientes na sala: ${room.clientList.length}`);

        return;

    // Lida com erros
    } catch (error) {
        if (error.name !== SocketEvents.GameError)
            throw error;
    }
}

/**
 * Validação para entrar em sala
 */
function joinRoomValidation(io: Server, client: SocketClient, data?: any) {
    const code = data ? data.room_id : null;

    // Certifica que o cliente não está em outra sala
    if (client.room)
        client.emitError(GameExceptions.UserAlreadyInRoom).raise();

    // Certifica que existe uma sala com esse id
    const room = Room.getRoom(code);
    if (!room)
        client.emitError(GameExceptions.RoomDoesNotExist).raise();

    // Certifica que a sala ainda não está cheia
    if (room.clientList.length >= room.size)
        client.emitError(GameExceptions.RoomIsFull).raise();

    return { room };
}