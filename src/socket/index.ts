import { Server } from 'socket.io';
import { APISocket } from 'src/@types/socket';

import { useMiddlewares } from './middlewares';

import { SocketEvents } from '@config/socket';
import { socketAuth } from './middlewares/auth';
import { socketUserValidation } from './middlewares/validateUser';
import { SocketClient } from './helpers/clients';
import { clientDisconnect } from './actions/disconnect';


/**
 * Função base de aplicação dos sistemas de socket para a permissão de jogos multiplayer.
 */
export function useSocket(io: Server) {
    // Aplica middlewares
    useMiddlewares(io, [socketAuth, socketUserValidation]);

    // Inicia a conexão
    try {
    io.on(SocketEvents.ClientConnect, (socket: APISocket) => {
        // // Cria um cliente
        const client = new SocketClient(socket, socket.client.user);

        // // Cria jogo
        // socket.on(SocketEvents.CreateMatch, (data) => actions.CreateMatch(io, client, data));

        // // Entra em sala de jogo
        // socket.on(SocketEvents.JoinMatch, (data) => actions.JoinMatch(io, client, data));

        // // Afirma estar pronto
        // socket.on(SocketEvents.Ready, (data) => actions.Ready(io, client, data));

        // // Começa o jogo
        // socket.on(SocketEvents.StartGame, (data) => actions.StartGame(io, client, data));

        // // Lida com as respostas do jogador
        // socket.on(SocketEvents.Answer, (data) => actions.Answer(io, client, data));

        // Quando o jogador for desconectado
        socket.on(SocketEvents.ClientDisconnected, (data) => clientDisconnect(io, client, data));
    })
    } catch(err) {
        console.log('SOCKET ERROR!');
        console.log(err.name);
        console.log(err.message);
    }
}
