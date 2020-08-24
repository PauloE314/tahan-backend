import { SocketEvents } from "@config/socket";
import { APISocket } from "src/@types/socket";
import { Server } from "socket.io";
import { SocketClient } from "src/socket/general/clients";
/**
 * Erro base da aplicação que permite a utilização de vários dados, não apenas strings
 */
export class Err extends Error {
    data: any;
    
    constructor(name: string, data: any) {
        super();
        this.name = name;
        this.data = {
            name,
            data
        }
    }
}

export interface IGameException {
    name: string,
    code: number,
    message: string
}
/**
 * Erros base de jogo. Esses erros devem ser enviados para o usuário e não agir como um erro mesmo
 */
export class GameError {
    public error: Err;
    public gameError: IGameException;

    constructor(gameError: IGameException) {
        this.gameError = gameError;
        this.error = new Err(SocketEvents.GameError, this.gameError);
    }

    // Envia o erro ao cliente
    sendToClient(client: APISocket) {
        client.emit(SocketEvents.GameError, this.gameError);
    }

    // Ativa o erro
    raise() {
        throw this.error;
    }
}
