import { Server } from "socket.io";
import { APISocket } from "src/@types/socket";

import { Users } from "@models/User";

import { Room } from "./rooms";
/**
 * Classe base para os clientes da aplicação. Embora essa entidade seja direcionada para as funcionalidades envolvendo jogos multiplayer, trata-se de uma abstração para facilitar a comunicação com um cliente, seja por chat, jogo, ou qualquer outra coisa
 */
export class SocketClient {
    static clients: { [id: number]: SocketClient } = {};

    public socket: APISocket;
    public user: Users;
    public gameRoomId: string;

    // Sala a qual o usuário pertence
    get gameRoom() { return Room.getRoom(this.gameRoomId) }

    constructor(socket: APISocket, user: Users) { 
        this.socket = socket;
        this.user = user;
        // Salva o cliente na lista de clientes
        SocketClient.clients[this.user.id] = this;
    }

    
    /**
     * Lida com a desconexão do usuário
     */
    disconnect(io: Server) {
        this.gameRoom.clientDisconnected(this);
    }
    /**
     * Remove um dos clientes da lista de clientes
     */
    static removeClient(userId: number) {
        delete SocketClient.clients[userId];
    }
}