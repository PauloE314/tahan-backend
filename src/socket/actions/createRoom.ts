import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { Room } from "../helpers/rooms";
import { GameExceptions, SocketEvents } from "@config/socket";
import { IRoomCreatedOutput } from "src/@types/socket";
import { messagePrint } from "src/utils";

/**
 * Ação do socket que permite criar uma sala de jogo. O jogador que cria a sala de jogo se torna automaticamente seu jogador principal.
 */
export function createRoom(io: Server, client: SocketClient, data: any) {
    try {
        // Certifica que o jogador não está em outra sala
        if (client.inRoom)
            return client.emitError(GameExceptions.UserAlreadyInRoom);

        // Cria a sala
        const room = new Room();

        // Adiciona o cliente
        room.addClient(io, client);
        room.mainClient = client;

        // Envia dados da sala
        const response: IRoomCreatedOutput = { room_id: room.id }
        client.emit(SocketEvents.RoomCreated, response);

        // Mensagem
        messagePrint(`[NOVA SALA]: id: ${room.id}, total de salas: ${Object.keys(Room.rooms).length}`, 'blue');
    }
    catch(err) {
        // Avisa erro de criação de sala
        if (err.name == "RoomCreationFailed") {
            client.emitError(GameExceptions.CantCreateRoom);

            // Mensagem
            messagePrint(`[ERRO NA CRIAÇÃO DE SALA]: total de salas: ${Object.keys(Room.rooms).length}`, 'red');
        }

        throw err;
    }
}