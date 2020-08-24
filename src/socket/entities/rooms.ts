import { SocketClient } from "./clients";
import {  Server } from "socket.io";
import { Game } from "./games";
import { getRandomValue, messagePrint } from "src/utils";
import { Err } from "src/utils/baseError";
import { SocketEvents } from "@config/socket";
import { Quizzes } from "@models/quiz/Quizzes";

interface IRoomClients {
    [userId: number]: SocketClient
}

/**
 * Classe base para as salas que precedem os jogos da aplicação.
 */
export class Room {
    // Listagem de salas
    static rooms: { [id: string]: Room } = {};

    // Propriedades da sala de jogo
    public id: string;
    public size: number;

    // Jogadores
    public clients: IRoomClients = {};
    get clientList (): Array<SocketClient> { return Object.values(this.clients); }
    public mainClient: SocketClient;

    // Jogo
    public quiz?: Quizzes;
    get game() { return Game.getGame(this.id) }

    constructor(size: number) {
        const roomsIdList = Object.keys(Room.rooms);
        
        this.id = getRandomValue(4, roomsIdList);
        this.size = size;

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
        console.log('ENVIANDO!')
        io.to(this.id).emit(event, data);
    }

    /**
     * Adiciona o cliente à sala
     */
    addClient(io: Server, client: SocketClient) {
        // Sai da sala antiga
        if (client.roomId) {
            client.room.clientLeaveRoom(io, client);
        }

        // Adiciona o usuário à sala
        client.roomId = this.id;
        client.socket.join(this.id);
        
        this.clients[client.user.id] = client;

        this.sendToAll(io, SocketEvents.GameError, 'Testando');
    }

    /**
     * Checa se todos estão prontos 
     */
    allReady() {
        for (const client of this.clientList) {
            // Checa se um cliente não está pronto
            if (client.isReady === false)
                return false;
        }
        
        return true;
    }

    /**
     * Seta todos como não prontos 
     */
    setAllNotReady() {
        for (const client of this.clientList)
            client.isReady = false;
    }


    /**
     * Lida com a saída de um usuário da sala
     */
    async clientLeaveRoom(io: Server, client: SocketClient) {
        // Avisa ao jogo que um jogador desconectou
        if (this.game)
            await this.game.clientLeave(io, client);

        // Remove o jogador da lista de jogadores
        delete this.clients[client.user.id];

        // Sai da sala do socket
        client.leaveRoom();

        // Avisa ao jogador que a saída da sala ocorreu bem
        client.emit(SocketEvents.LeaveRoom);

        // Caso a sala ainda tenha clientes
        if (this.clientList.length) {
            const oldMainClientId = this.mainClient.user.id;

            // Seta um novo cliente principal
            this.mainClient = this.clientList[0];
            const newMainClientId = this.mainClient.user.id;

            // Avisa que o usuário saiu
            this.sendToAll(io, SocketEvents.PlayerLeave, {
                user: client.user,
                main: newMainClientId !== oldMainClientId ? this.mainClient.user: undefined
            });

            // Mensagem
            messagePrint(`[USUÁRIO SAINDO DE SALA]: username: ${client.user.username} id: ${this.id}, total de usuários da sala: ${Object.keys(this.clients).length}, total de salas: ${Object.keys(Room.rooms).length}`);
        }
        

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