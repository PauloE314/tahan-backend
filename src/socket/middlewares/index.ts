import { Server } from "socket.io";
import { APISocket } from "src/@types/socket";


type ISocketMiddleware = (socket: APISocket, next: (err?: any) => any) => Promise<any>;

/**
 * Ativador de middlewares para os sistemas de socket 
 */
export function useMiddlewares(io: Server, middlewares: Array<ISocketMiddleware>) {
    middlewares.forEach(middleware => io.use(middleware));
}
