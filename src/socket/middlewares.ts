import { auth_user } from "../utils/";
import { Err } from '../utils/classes';
import { APISocket } from 'src/@types';
import { SocketErrors } from "@config/socket"
import { Server } from "socket.io";

// Aplica os middlewares
export async function useMiddlewares(io: Server) {
    const middlewares = [Auth];

    middlewares.forEach(middleware => io.use(middleware));
}


// Middleware de autenticaçãp
async function Auth(socket: APISocket, next: (err?: any) => any) {
    const { token } = socket.request._query;
    
    try {
        const user = await auth_user({ token: String(token), raiseError: true, bearer: false});
        
        if (!user) 
            return next(new Err(SocketErrors.PermissionDenied, "Permissão negada"));

        socket.client.data = user;
        return next();
    }
    catch(err) {
        return next(new Err(SocketErrors.PermissionDenied, err.message));
    }
}
