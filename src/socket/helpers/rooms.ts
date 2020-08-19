import { SocketClient } from "./clients";
import {  Server } from "socket.io";
import { Game } from "./games";
import { getRandomValue, messagePrint } from "src/utils";
import { Err } from "src/utils/baseError";
import { SocketEvents } from "@config/socket";

/**
 * Classe base para as salas que precedem os jogos da aplicação.
 */
export class Room {
    // Listagem de salas
    static rooms: { [id: string]: Room } = {};

    // Propriedades da sala de jogo
    public id: string;

    // Jogadores
    public clients: Array<SocketClient> = [];
    public mainClient: SocketClient;

    // Jogo
    get game() { return Game.getGame(this.id) }

    constructor() {
        const roomsIdList = Object.keys(Room.rooms);
        this.id = getRandomValue(4, roomsIdList);

        // Certifica que ainda há salas disponíveis
        if (!this.id)
            throw new Err("RoomCreationFailed", null);
            
        // Salva sala
        Room.rooms[this.id] = this;
    }

    /**
     * Envia mensagem para todos os usuários da sala
     */
    sendToAll(io: Server, event: string, data?: any) {
        io.to(this.id).emit(event, data);
    }

    /**
     * Adiciona o cliente à sala
     */
    addClient(io: Server, client: SocketClient) {
        // Sai da sala antiga
        if (client.roomId) {
            client.room.clientLeaveRoom(client, io);
        }

        // Adiciona o usuário à sala
        client.roomId = this.id;
        client.socket.join(this.id);
        
        this.clients.push(client);
    }

    /**
     * Lida com a saída de um usuário da sala
     */
    async clientLeaveRoom(client: SocketClient, io: Server) {
        // Avisa ao jogo que um jogador desconectou
        if (this.game)
            await this.game.clientLeave(client, io);

        // Avisa aos demais jogadores que ele saiu da sala
        client.emitToRoom(SocketEvents.PlayerLeaveRoom, client.user);

        // Remove o jogador da lista de jogadores
        this.clients = this.clients.filter(roomClient => roomClient.user.id !== client.user.id);

        // Sai da sala do socket
        client.socket.leave(client.roomId);    
        client.roomId = undefined;

        // Avisa ao jogador que a saída da sala ocorreu bem
        client.emit(SocketEvents.RoomLeaved);

        // Mensagem
        if (this.clients.length !== 0) 
            messagePrint(`[USUÁRIO SAINDO DE SALA]: username: ${client.user.username} id: ${this.id}, total de usuários da sala: ${this.clients.length}, total de salas: ${Object.keys(Room.rooms).length}`);
        

        // Apaga a sala
        else {
            Room.removeRoom(this.id);
            messagePrint(`[SALA APAGADA]: id: ${this.id}, total de salas: ${Object.keys(Room.rooms).length}`, 'red')
        }
    }
    

    /**
     * Retorna uma sala
     */
    static getRoom(id: string) {
        return Room.rooms[id];
    }
    /**
     * Apaga uma sala
     */
    static removeRoom(id: string) {
        delete Room.rooms[id];
    }
}