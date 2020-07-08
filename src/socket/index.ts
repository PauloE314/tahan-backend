import { Server, Socket } from 'socket.io';

import { SocketEvents } from '@config/socket';
import { useMiddlewares } from "./middlewares";
import actions from "./actions";
import { APISocket } from 'src/@types';

const room_name = 'sala-teste';


export default function useSocket(io: Server) {
    // Aplica middlewares
    useMiddlewares(io);

    // Inicia a connexão
    io.on(SocketEvents.ClientConnect, (socket: APISocket) => {
        // console.log(socket.id);
        // socket.join(room_name);
        // const room = io.sockets.adapter.rooms[room_name];
        // //@ts-ignore
        // room.data = 'lorem';
        // //@ts-ignore
        // socket.emit('new-member', room.data);


        // Cria jogo
        socket.on(SocketEvents.Creategame, (data) => actions.CreateGame(io, socket, data));

        // Entra em sala para jogar
        socket.on(SocketEvents.JoinGame, (data) => actions.JoinGame(io, socket, data));

        // Põe o jogador como pronto
        socket.on(SocketEvents.Ready, (data) => actions.Ready(io, socket, data));


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