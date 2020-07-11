import { Server } from "socket.io";
import { APISocket } from "src/@types/socket";
import { Users } from "@models/User";
import { GameErrorModel, GameErrors, SocketEvents } from '@config/socket'


interface ClientList {
    [id: number]: Client
}

// Armazena as conexões
const clients: ClientList = {};

// Modelo de um cliente
export default class Client {
    public socket: APISocket;
    // public io: Server;
    public user: Users;
    public room_key: string | null;
    
    // Cria um novo cliente
    constructor(io: Server, socket: APISocket, user: Users) {
        // this.io = io;
        this.socket = socket;
        this.user = user;
        clients[this.user.id] = this;

        // Quando o usuário for desconectado, retira-o da lista de clientes
        this.socket.on(SocketEvents.ClientDisconnected, () => {
            delete clients[this.user.id];
            const survived = [];
            for (let client in clients) {
                survived.push(clients[client].user.username);
            }
            console.log('clientes: ');
            console.log(survived)
        })
    }

    // Adiciona o usuário a uma sala
    public joinRoom(room_id: string) {
        if (this.room_key)
            this.socket.leave(this.room_key);

        this.socket.join(room_id);
    }

    // Adiciona o usuário a uma nova sala
    public joinNewRoom(io: Server, room_id: string) {
        const all_rooms = io.sockets.adapter.rooms;
        const room = all_rooms[room_id];
        // Caso a sala exista, retorna false
        if (room)
            return false;
        // Entra na sala
        this.joinRoom(room_id);
        return true;
    }

    // Adiciona o cliente a uma sala já existente
    public joinToExistentRoom(io: Server, room_id: string) {
        const all_rooms = io.sockets.adapter.rooms;
        const room = all_rooms[room_id];
        // Caso a sala não exista, retorna false
        if (!room)
            return false;
        // Entra na sala
        this.joinRoom(room_id);
        return true;
    }



    // Emite evento para todos da sala
    public emitToMatch(io: Server, event_name: string, data?: any, options?: { except_sender: boolean }) {
        // Caso o usuário não esteja em uma sala, retorna false
        if (!this.room_key)
            return false;

        const except_sender = options ? options.except_sender : false;
        const event_data = data ? data : null;
        // Emite o evento para todos exceto o usuário
        if (except_sender)
            this.socket.broadcast.to(this.room_key).emit(event_name, event_data);
        // Emite o evento para todos
        else
            io.to(this.room_key).emit(event_name, event_data);
    }

    // Emite para o cliente
    public emit(event_name: string, event_data?: any) {
        this.socket.emit(event_name, event_data ? event_data : null);
    }

    // Emite erro
    public emitError(err: GameErrorModel) {
        const new_error = new GameError(err);
        new_error.sendToClient(this);
    }

    // Permite lidar com eventos
    public on(event_name: string, cb: (socket: APISocket, ...data: any) => any) {
        this.socket.on(event_name, () => cb(this.socket))
    }


    get rooms() {
        return this.socket.rooms;
    }

    public static get_client(id: number ) {
        return clients[id];
    }
}



// Erro de jogo
export class GameError {
    public game_error: GameErrorModel; 
    private error: Error;

    constructor(game_error: GameErrorModel) {
        // Tenta pegar os dados do erro
        const error_exists = Object.keys(GameErrors).map(
            game_err_name => GameErrors[game_err_name]
        ).filter(
            game_err => game_err.code == game_error.code
        )
        // Caso não exista nenhum erro com esse código, para o código
        if (!(error_exists.length))
            throw new Error('Esse código de erro não existe');

        this.game_error = error_exists[0];
        console.log(this.game_error);
        // Armazena o erro real do JS
        const err = new Error();
        err.name = this.game_error.name;
        err.message = this.game_error.message;
        this.error = err;   
    }
    // Envia o erro ao cliente
    sendToClient(user: Client) {
        user.emit('GAME_ERROR', this.game_error);
    }
    // Ativa o erro real
    raiseError() {
        throw this.error;
    }
}