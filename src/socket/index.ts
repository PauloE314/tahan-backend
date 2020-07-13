import { Server, Socket } from 'socket.io';

import { SocketEvents } from '@config/socket';
import { useMiddlewares } from "./middlewares";
import actions from "./actions";
import { APISocket } from 'src/@types/socket';
import Client from './helpers/client';




export default function useSocket(io: Server) {
    // Aplica middlewares
    useMiddlewares(io);

    // Inicia a connexão
    io.on(SocketEvents.ClientConnect, (socket: APISocket) => {
        // Cria um cliente
        const client = new Client(io, socket, socket.client.user.info);

        // Cria jogo
        socket.on(SocketEvents.CreateMatch, (data) => actions.CreateMatch(io, client, data));

        // Entra em sala de jogo
        socket.on(SocketEvents.JoinMatch, (data) => actions.JoinMatch(io, client, data));

        // Afirma estar pronto
        socket.on(SocketEvents.Ready, (data) => actions.Ready(io, client, data));

        // Começa o jogo
        socket.on(SocketEvents.StartGame, (data) => actions.StartGame(io, client, data));

        // Lida com as respostas do jogador
        socket.on(SocketEvents.Answer, (data) => actions.Answer(io, client, data));

        // Quando o jogador for desconectado
        socket.on(SocketEvents.ClientDisconnected, () => {
            
        })
    })
}