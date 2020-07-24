import { auth_user } from "../utils/";
import { Err } from '../utils/classes';
import { APISocket } from 'src/@types/socket';
import { GameErrors, SocketEvents } from "@config/socket"
import { Server } from "socket.io";
import Client from "./helpers/client";
import { GameError } from './helpers/client'


// Aplica os middlewares
export async function useMiddlewares(io: Server) {
    const middlewares = [Auth];

    middlewares.forEach(middleware => io.use(middleware));
}


// Middleware de autenticação
async function Auth(socket: APISocket, next: (err?: any) => any) {
    const { token } = socket.request._query;

    // permission_denied.sendToSocket(socket);
    
    try {
        const user = await auth_user({ token: String(token), raiseError: true, bearer: false});
        
        if (!user) {
            const permission_denied = new GameError(GameErrors.PermissionDenied);
            return next(permission_denied.error);
        }

        if (Client.get_client(user.info.id)) {
            const double_user = new GameError(GameErrors.DoubleUser);
            return next(double_user.error);
        }

        socket.client.user = user;
        return next();
    }
    catch(err) {
        return next(new Err(GameErrors.PermissionDenied.name, err.message));
    }
}