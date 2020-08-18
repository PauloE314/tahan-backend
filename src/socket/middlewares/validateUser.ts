import { APISocket } from "src/@types/socket";

/**
 * Middleware que valida o usuário. Esse middleware não checa a autenticação do usuário, mas sim sua validade quanto a um cliente
 */
export async function socketUserValidation(socket: APISocket, next: (foo?: any) => any) {
    // TO DO
    return next();
}