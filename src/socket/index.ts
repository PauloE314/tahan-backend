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
        
        // Retorna dados de um quiz
        socket.on(SocketEvents.LoadGame, (data) => actions.LoadGame(socket, data));
        
        // Começa o jogo
        socket.on(SocketEvents.StartGame, (data) => actions.StartGame(socket, data));

        // Quando o usuário responder
        socket.on(SocketEvents.Answer, (data) => actions.HandleAnswer(socket, data));


        // Cria jogo
        socket.on(SocketEvents.Creategame, (data) => actions.CreateGame(socket, data));

        // Entra em sala para jogar
        socket.on(SocketEvents.JoinGame, (data) => actions.JoinGame(socket, data));

        // Põe o jogador como pronto
        socket.on(SocketEvents.Ready, (data) => actions.Ready(socket, data));

        // Quando o usuário responder
        // socket.on(SocketEvents.Answer, (data) => actions.HandleAnswer(socket, data));

        /*
            - Cada sala só pode ter um ou dois usuários
            - Cada usuário só pode estar em uma sala
            - Se ambos os usuários devem estar sempre na mesma questão
            - Quando o tempo acabar, o jogador perde a questão
            - Se um dos jogadores sair da partida depois que ela começa, ambos perdem
        */
    })
}