import { Server } from "socket.io";
import { APISocket } from "src/@types";
import { Users } from "@models/User";

// Armazena as conexões
const connections: Client[] = [];

// Modelo de um cliente
export default class Client {
    public socket: APISocket;
    public io: Server;
    public room_code: string | null;
    public user: Users;
    
    // Cria um novo cliente
    constructor(io: Server, socket: APISocket, user: Users) {
        this.io = io;
        this.socket = socket;
        this.user = user;
        connections.push(this);
    }

    // Adiciona o usuário a uma sala
    public joinRoom(room_id: string) {
        this.room_code = room_id;
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
    public emitRoom(event_name: string, data?: any, options?: { except_sender: boolean }) {
        // Caso o usuário não esteja em uma sala, retorna false
        if (!this.room_code)
            return false;

        const except_sender = options ? options.except_sender : false;
        const event_data = data ? data : null;
        // Emite o evento para todos exceto o usuário
        if (except_sender)
            this.socket.broadcast.to(this.room_code).emit(event_name, event_data);
        // Emite o evento para todos
        else
            this.io.to(this.room_code).emit(event_name, event_data);
    }

    // Emite para o cliente
    public emit(event_name: string, event_data?: any) {
        this.socket.emit(event_name, event_data ? event_data : null);
    }

    // Permite lidar com eventos
    public on(event_name: string, cb: (io: Server, socket: APISocket, ...data: any) => any) {
        this.socket.on(event_name, () => cb(this.io, this.socket))
    }
}