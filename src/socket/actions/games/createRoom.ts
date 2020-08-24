import { Server } from "socket.io";
import { SocketClient } from "src/socket/entities/clients";
import { Room } from "src/socket/entities/rooms";
import { GameExceptions, SocketEvents } from "@config/socket";
import { messagePrint } from "src/utils";

/**
 * Ação do socket que permite criar uma sala de jogo. O jogador que cria a sala de jogo se torna automaticamente seu jogador principal.
 */
export function createRoom(io: Server, client: SocketClient, data?: any) {
    try {
        // Valida ação de criação
        createRoomValidation(io, client, data);

        // Cria a sala
        const room = new Room(2);

        // Adiciona o cliente
        room.addClient(io, client);
        room.mainClient = client;

        // Envia dados da sala
        client.emit(SocketEvents.CreateRoom, { room_id: room.id });

        // Mensagem
        messagePrint(`[NOVA SALA]: id: ${room.id}, total de salas: ${Object.keys(Room.rooms).length}`, 'blue');
    }
    catch(error) {
        // Avisa erro de criação de sala
        if (error.name == "RoomCreationFailed") {
            client.emitError(GameExceptions.CantCreateRoom);

            // Mensagem
            messagePrint(`[ERRO NA CRIAÇÃO DE SALA]: total de salas: ${Object.keys(Room.rooms).length}`, 'red');
        }

        if (error.name !== SocketEvents.GameError)
            throw error;
    }
}

/**
 * Função de validação de criação de sala
 */
function createRoomValidation(io: Server, client: SocketClient, data?: any) {
    const { room } = client;

    // Certifica que o cliente não está em uma sala
    if (room)
        client.emitError(GameExceptions.UserAlreadyInRoom).raise();
}