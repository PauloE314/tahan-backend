import { Server, Socket } from 'socket.io';

import { SocketEvents } from '@config/socket';
import { useMiddlewares } from "./middlewares";
import actions from "./actions";
import { APISocket } from 'src/@types';
import Client from './helpers/client';
import { Test } from './helpers/game'

const room_name = 'sala-teste';


export default function useSocket(io: Server) {
    // Aplica middlewares
    useMiddlewares(io);

    // Inicia a connexão
    io.on(SocketEvents.ClientConnect, (socket: APISocket) => {
        const test = new Test();
        test.addPlayer1(socket.id);
        test.addPlayer2('sua mãe');
        test.save();

        console.log(test.getAllGames());
        // Cria um cliente
        // const client = new Client(io, socket, socket.client.user.info);

        // Cria jogo
        // socket.on(SocketEvents.Creategame, (data) => actions.CreateGame(io, client, data));

        // // Entra em sala para jogar
        // socket.on(SocketEvents.JoinGame, (data) => actions.JoinGame(io, client, data));

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