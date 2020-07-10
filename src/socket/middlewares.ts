import { auth_user } from "../utils/";
import { Err } from '../utils/classes';
import { APISocket } from 'src/@types';
import { GameErrors } from "@config/socket"
import { Server } from "socket.io";
import Client from "./helpers/client";


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
            return next(new Err(GameErrors.PermissionDenied.name, "Permissão negada"));
 
        if (Client.get_client(user.info.id)) {
            console.log('mesmo usuário: ' + Client.get_client(user.info.id).user.username)
            return next(new Err(GameErrors.PermissionDenied.name, "Já existe outro dispositivo com esse cliente"));
        }

        socket.client.user = user;
        return next();
    }
    catch(err) {
        return next(new Err(GameErrors.PermissionDenied.name, err.message));
    }
}