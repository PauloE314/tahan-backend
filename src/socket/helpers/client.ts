import { Server } from "socket.io";
import { APISocket } from "src/@types";
import { Users } from "@models/User";
import { GameError } from './game';
import { GameErrorModel, GameErrors, SocketEvents } from '@config/socket'
import { getRepository } from "typeorm";

// Armazena as conexões
const connections: Client[] = [];

// Modelo de um cliente
export default class Client {
    public socket: APISocket;
    public io: Server;
    public user: Users;
    public match_code: string | null;
    
    // Cria um novo cliente
    constructor(io: Server, socket: APISocket, user: Users) {
        this.io = io;
        this.socket = socket;
        this.user = user;
        connections.push(this);
    }

    // Adiciona o usuário a uma sala
    public joinRoom(room_id: string) {
        if (this.match_code)
            this.socket.leave(this.match_code);

        this.socket.join(room_id);
    }

    // Adiciona o usuário a uma nova sala
    public joinNewRoom(room_id: string) {
        const all_rooms = this.io.sockets.adapter.rooms;
        const room = all_rooms[room_id];
        // Caso a sala exista, retorna false
        if (room)
            return false;
        // Entra na sala
        this.joinRoom(room_id);
        return true;
    }

    // Adiciona o cliente a uma sala já existente
    public joinToExistentRoom(room_id: string) {
        const all_rooms = this.io.sockets.adapter.rooms;
        const room = all_rooms[room_id];
        // Caso a sala não exista, retorna false
        if (!room)
            return false;
        // Entra na sala
        this.joinRoom(room_id);
        return true;
    }



    // Emite evento para todos da sala
    public emitToMatch(event_name: string, data?: any, options?: { except_sender: boolean }) {
        // Caso o usuário não esteja em uma sala, retorna false
        if (!this.match_code)
            return false;

        const except_sender = options ? options.except_sender : false;
        const event_data = data ? data : null;
        // Emite o evento para todos exceto o usuário
        if (except_sender)
            this.socket.broadcast.to(this.match_code).emit(event_name, event_data);
        // Emite o evento para todos
        else
            this.io.to(this.match_code).emit(event_name, event_data);
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
    public on(event_name: string, cb: (io: Server, socket: APISocket, ...data: any) => any) {
        this.socket.on(event_name, () => cb(this.io, this.socket))
    }


    get rooms() {
        return this.socket.rooms;
    }


}


export async function handleMatchDisconect(client: Client) {
    // caso não exista um match
    if (!client.match_code)
        return;

    const { match_code, io } = client;

    // Caso seja o jogador que criou o match
    if (true) {
        // Avisa que o jogador principal está saindo
        client.emitToMatch(SocketEvents.MainPlayerOut, client.user, { except_sender: true });
        // Retira todos os cliente do ROOM

        io.in(match_code).clients((err, socket_ids: Array<string>) => {
            socket_ids.forEach((id: string) => {
                const sockets = io.of('/').connected;
                if (sockets[id])
                    sockets[id].leave(match_code);
            });
        })
    }
    // Caso não seja
    else {
        // Avisa que está saindo do match
        client.emitToMatch(SocketEvents.SecondaryPlayerOut, client.user, { except_sender: true });
        client.socket.leave(client.match_code);
    }
}