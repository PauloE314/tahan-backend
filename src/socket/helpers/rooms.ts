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
    public players: Array<SocketClient> = [];
    public mainPlayer: SocketClient;

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
    addClient(client: SocketClient) {
        client.roomId = this.id;
        this.players.push(client);
    }

    /**
     * Lida com a saída de um usuário da sala
     */
    async clientLeaveRoom(client: SocketClient, io: Server) {        
        client.roomId = undefined;

        // Remove o jogador da lista de jogadores
        this.players = this.players.filter(player => player.user.id !== client.user.id);

        // Avisa ao jogo que um jogador desconectou
        if (this.game)
            await this.game.clientLeave(client, io);

        // Avisa ao jogador que a saída da sala ocorreu bem
        client.emit(SocketEvents.RoomLeaved);

        // Avisa aos demais jogadores que ele saiu do jogo
        if (this.players.length !== 0)
            client.emitToRoom(SocketEvents.PlayerLeaveRoom, client.user);

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