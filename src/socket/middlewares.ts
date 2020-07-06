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

// Checa os dados
export async function assertData(socket: APISocket) {
    const { gameMode, quiz, time, timeToNextQuestion } = socket.client;
    const message = "Ocorreu algum erro no quiz";
    
    if (!quiz) {
        socket.emit(SocketErrors.AssertData, { name: 'quiz', default_message: 'Esse quiz não existe', message });
        return false;
    }

    // Checa se o modo de jogo é válido
    if (gameMode !== 'multi' && gameMode !== 'single') {
        socket.emit(SocketErrors.AssertData, {
            name: 'gameMode', default_message: 'O modo de jogo deve ser "single" ou "multi"', message
        });
        return false;
    }

    // Checa se o tempo é válido
    if (time == undefined) {
        socket.emit(SocketErrors.AssertData, { name: 'time', default_message: 'Envie um "time" válido', message });
        return false;
    }

    // Checa se o tempo é válido
    if (timeToNextQuestion == undefined) {
        socket.emit(SocketErrors.AssertData, {
            name: 'timeToNextQuestion', default_message: 'Envie um "timeToNextQuestion" válido', message
        });
        return false;
    }
    return true;
}