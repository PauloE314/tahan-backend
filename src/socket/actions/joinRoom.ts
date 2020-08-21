import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { GameExceptions, SocketEvents } from "@config/socket";
import { Room } from "../helpers/rooms";
import { messagePrint } from "src/utils";
import { clientIsInRoom } from "../helpers/validator";

/**
 * Ação que permite um usuário entrar em uma sala de jogo. Existe uma hierarquia entre os jogadores que entram na sala, de forma com que, caso o jogador principal saia do jogo, o jogador principal se torna o que entrou na sala logo após ele.
 */
export async function joinRoom(io: Server, client: SocketClient, data?: any) {
    try {
        const code = data ? data.room_id : null;
        
        // Certifica que o jogador não está em outra sala
        clientIsInRoom(client, false);

        // Certifica que existe uma sala com esse id
        const room = Room.getRoom(code);
        if (!room)
            return client.emitError(GameExceptions.RoomDoesNotExist);

        // Certifica que a sala ainda não está cheia
        if (room.clients.length >= room.size)
            return client.emitError(GameExceptions.RoomIsFull);

        // Dados da sala
        const roomData: any = {
            users: room.clients.map(player => player.user)
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
        messagePrint(`[USUÁRIO ENTROU EM SALA]: username: ${client.user.username}, roomId: ${room.id}, total de clientes na sala: ${room.clients.length}`);

        return;

    // Lida com erros
    } catch (error) {
        if (error.name !== SocketEvents.GameError)
            throw error;
    }
}