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
        console.log(client.user.username + ' connectou - ' + client.socket.id)

        // Cria jogo
        socket.on(SocketEvents.CreateMatch, (data) => actions.CreateMatch(io, client, data));

        // Entra em sala de jogo
        socket.on(SocketEvents.JoinMatch, (data) => actions.JoinMatch(io, client, data));

        // Afirma estar pronto
        socket.on(SocketEvents.Ready, (data) => actions.Ready(io, client, data));

        // Começa o jogo
        socket.on(SocketEvents.StartGame, (data) => actions.StartGame(io, client, data));

        // Lida com as respostas do jogador
        socket.on(SocketEvents.Answer, (data) => actions.Ready(io, client, data));

        // Quando o jogador for desconectado
        socket.on(SocketEvents.ClientDisconnected, () => {
            console.log(client.user.username + ' desconectando...');
        })

        // // Põe o jogador como pronto
        // socket.on(SocketEvents.Ready, (data) => actions.Ready(io, client, data));


        // Lida com a desconexão de um dos jogadores
        // socket.on(SocketEvents.ClientDisconnected, (data) => actions.Disconnect(socket, data))


        /*
            - Cada sala só pode ter um ou dois usuários
            - Cada usuário só pode estar em uma sala
            - Se ambos os usuários devem estar sempre na mesma questão
            - Quando o tempo acabar, o jogador perde a questão
            - Se um dos jogadores sair da partida depois que ela começa, ambos perdem
        */
    })
}