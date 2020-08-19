import { Users } from "@models/User";

export interface ISocketClient extends SocketIO.Client {
    user: Users
}
// Modelo de socket
export interface APISocket extends SocketIO.Socket {
    client: ISocketClient
}


// Modelo de criação de sala
export interface IRoomCreatedOutput {
    room_id: string
}

// Modelo de dados para entrar em sala
export interface IJoinRoomInput {
    room_id: string
}