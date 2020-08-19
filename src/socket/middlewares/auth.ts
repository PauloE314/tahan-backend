import { APISocket } from "src/@types/socket";
import { authUser } from "src/utils";
import { GameError, Err } from "src/utils/baseError";
import { GameExceptions } from "@config/socket";
import { SocketClient } from "../helpers/clients";


/**
 * Middleware de socket de autenticação de usuário
 */
export async function socketAuth(socket: APISocket, next: (err?: any) => any) {
    const { token } = socket.request._query;
    
    try {
        // Carrega o usuário
        const user = await authUser({ token: String(token), raiseError: true, bearer: false});
        
        // Certifica que o usuário existe
        if (!user) {
            const permissionDenied = new GameError(GameExceptions.UserDoesNotExist);
            return next(permissionDenied.error);
        }

        // Certifica que não há outro usuário com a mesma conta
        if (SocketClient.getClient(user.info.id)) {
            const doubleUser = new GameError(GameExceptions.DoubleUser);
            return next(doubleUser.error);
        }

        // Salva seus dados
        socket.client.user = user.info;
        return next();
    }

    // Ativa o erro de validação
    catch(err) {
        return next(new Err(GameExceptions.PermissionDenied.name, err.message));
    }
}