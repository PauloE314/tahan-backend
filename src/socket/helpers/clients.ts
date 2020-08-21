import { Server } from "socket.io";
import { APISocket } from "src/@types/socket";

import { Users } from "@models/User";

import { Room } from "./rooms";
import { GameError, IGameException, Err } from "src/utils/baseError";
import { GameExceptions, SocketEvents } from "@config/socket";
import { Game } from "./games";
import { messagePrint } from "src/utils";

/**
 * Classe base para os clientes da aplicação. Embora essa entidade seja direcionada para as funcionalidades envolvendo jogos multiplayer, trata-se de uma abstração para facilitar a comunicação com um cliente, seja por chat, jogo, ou qualquer outra coisa
 */
export class SocketClient {
    // Listagem de clientes
    static clients: { [id: number]: SocketClient } = {};

    // Propriedades do cliente
    public socket: APISocket;
    public user: Users;

    // Sala a qual o usuário pertence
    public roomId?: string;
    get room() { return Room.getRoom(this.roomId) }


    constructor(socket: APISocket, user: Users) { 
        this.socket = socket;
        this.user = user;
        
        // Salva o cliente na lista de clientes
        SocketClient.clients[this.user.id] = this;
    }

    /**
     * Envia mensagem para o usuário
     */
    emit(event: string, data?: any) {
        this.socket.emit(event, data);
    }

    /**
     * Envia mensagem para usuários da sala
     */
    emitToRoom(event: string, data?: any) {
        this.socket.broadcast.to(this.roomId).emit(event, data);
    }

    /**
     * Emite um erro genérico para o usuário. Pode para o código caso seja necessário, por padrão, não emite o erro no código mesmo
     */
    emitError(gameError: IGameException) {
        const exception = new GameError(gameError);

        // Envia para o usuário
        exception.sendToClient(this.socket);

        // Mensagem
        messagePrint(`[ERRO DO USUÁRIO]: username: ${this.user.username}, errorName: ${gameError.name}`, 'red');

        return exception;
}

    /**
     * Checa se o usuário está em jogo
     */
    get inGame() {
        return this.room ? (this.room.game ? this.room.game : false) : false;
    }

    /**
     * Checa se o usuário já está em uma sala
     */
    get inRoom() {
        return this.room ? this.room : false;
    }

    
    /**
     * Lida com a desconexão do usuário
     */
    async disconnect(io: Server) {
        // Remove o cliente da lista de clientes
        SocketClient.removeClient(this.user.id);
    }
    /**
     * Retorna um cliente com o id passado como parâmetro
     */
    static getClient(userId: number) {
        return SocketClient.clients[userId];
    }
    /**
     * Remove um dos clientes da lista de clientes
     */
    static removeClient(userId: number) {
        delete SocketClient.clients[userId];
    }
}
