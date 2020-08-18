import { APISocket } from "src/@types/socket";
import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";

export function clientDisconnect(io: Server, client: SocketClient, data: any) {
    client.disconnect(io);
}