import { APISocket } from "src/@types/socket";
import { authUser } from "src/utils";
import { GameError, Err } from "src/utils/baseError";
import { GameExceptions } from "@config/socket";


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
            const permission_denied = new GameError(GameExceptions.PermissionDenied);
            return next(permission_denied.error);
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