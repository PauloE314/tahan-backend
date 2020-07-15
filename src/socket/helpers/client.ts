import { Server } from "socket.io";
import { APISocket } from "src/@types/socket";
import { Users } from "@models/User";
import { GameErrorModel, GameErrors, SocketEvents } from '@config/socket';
import GameQuiz from './game';
import { Err } from "src/utils/classes";


interface ClientList {
    [id: number]: Client
}

// Armazena as conexões
const clients: ClientList = {};

export function client_status() {
    const client_list = Object.keys(clients);
    console.log('Clientes conectados:\n');
    console.log('----------------------------');
    client_list.forEach(client_id => {
        const client = <Client>clients[client_id];
        const room_key = client.room_key ? client.room_key : 'undefined';

        console.log('   nome: ' + client.user.username);
        console.log('   room_key: ' + room_key);
        console.log('   jogando: ' + (GameQuiz.get_game(room_key) ? 'true' : 'false'));
        console.log('----------------------------');
    });
    console.log('\n');
}

// Modelo de um cliente
export default class Client {
    public socket: APISocket;
    public user: Users;
    public room_key: string | null;
    
    // Cria um novo cliente
    constructor(io: Server, socket: APISocket, user: Users) {
        // this.io = io;
        this.socket = socket;
        this.user = user;
        clients[this.user.id] = this;

        // Quando o usuário for desconectado, retira-o da lista de clientes
        this.socket.on(SocketEvents.ClientDisconnected, () => delete clients[this.user.id])
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

    // Métodos globais
    public static get_client(id: number ) {
        return clients[id];
    }
}



// Erro de jogo
export class GameError {
    public game_error: GameErrorModel; 
    public error: Error;

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
        // Armazena o erro real do JS
        const err = new Err(SocketEvents.GameError, this.game_error);
        this.error = err;   
    }
    // Envia o erro ao cliente
    sendToClient(client: Client) {
        console.log('Enviando erro: ', client.user.username, this.game_error.message);
        client.emit(SocketEvents.GameError, this.game_error);
    }

    sendToSocket(socket: APISocket) {
        socket.emit(SocketEvents.GameError, this.game_error);
    }
    // Ativa o erro real
    raiseError() {
        throw this.error;
    }
}