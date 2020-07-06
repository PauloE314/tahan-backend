import { Server, Socket } from 'socket.io';

import { SocketEvents } from '@config/socket';
import { useMiddlewares } from "./middlewares";
import actions from "./actions";
import { APISocket } from 'src/@types';




export default function useSocket(io: Server) {
    // Aplica middlewares
    useMiddlewares(io);

    // Inicia a connexão
    io.on(SocketEvents.ClientConnect, (socket: APISocket) => {
        console.log(socket.id);        
        
        // Retorna dados de um quiz
        socket.on(SocketEvents.LoadGame, (data) => actions.LoadGame(socket, data));
        
        // Começa o jogo
        socket.on(SocketEvents.StartGame, (data) => actions.StartGame(socket, data))

        // Quando o usuário responder
        socket.on(SocketEvents.Answer, (data) => actions.HandleAnswer(socket, data))
    })
}