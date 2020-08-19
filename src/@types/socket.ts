import { Users } from "@models/User";

export interface ISocketClient extends SocketIO.Client {
    user: Users
}
// Modelo de socket
export interface APISocket extends SocketIO.Socket {
    client: ISocketClient
}


// Modelo de criação de sala
export interface IRoomCreatedData {
    room_id: string
}