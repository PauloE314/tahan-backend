import { Server } from 'socket.io';
import { APISocket } from 'src/@types/socket';

import { useMiddlewares } from './middlewares';

import { SocketEvents } from '@config/socket';
import { socketAuth } from './middlewares/auth';
import { SocketClient } from 'src/socket/entities/clients';
import { clientDisconnect } from './actions/general/disconnect';
import { createRoom } from 'src/socket/actions/games/createRoom';
import { leaveRoom } from 'src/socket/actions/games/leaveRoom';
import { messagePrint } from 'src/utils';
import { joinRoom } from 'src/socket/actions/games/joinRoom';
import { setQuiz } from 'src/socket/actions/games/setQuiz';
import { ready } from 'src/socket/actions/games/ready';
import { startGame } from 'src/socket/actions/games/startGame';
import { answer } from 'src/socket/actions/games/answer';
import { nextQuestion } from 'src/socket/actions/games/nextQuestion';
import { invite } from './actions/social/invite';
import { denyInvite } from './actions/social/denyInvite';
import { acceptInvite } from './actions/social/acceptInvite';


/**
 * Função base de aplicação dos sistemas de socket para a permissão de jogos multiplayer.
 */
export function useSocket(io: Server) {
    // Aplica middlewares
    useMiddlewares(io, [socketAuth]);

    // Inicia a conexão
    try {
    io.on(SocketEvents.ClientConnect, (socket: APISocket) => {
        // Cria um cliente
        const client = new SocketClient(socket, socket.client.user);
        
        // Mensagem
        messagePrint(`[NOVO USUÁRIO]: username: ${client.user.username}, total de usuários: ${Object.keys(SocketClient.clients).length}`, 'green');

        // Convida amigo
        socket.on(SocketEvents.RoomInvite, (data) => invite(io, client, data));

        // Aceitar entrar na sala
        socket.on(SocketEvents.InviteAccept, (data) => acceptInvite(io, client, data));

        // Nega entrar na sala
        socket.on(SocketEvents.InviteDeny, (data) => denyInvite(io, client, data));


        // Cria sala de jogo
        socket.on(SocketEvents.CreateRoom, (data) => createRoom(io, client, data));

        // Sai da sala de jogo
        socket.on(SocketEvents.LeaveRoom, (data) => leaveRoom(io, client, data));

        // Entra em sala de jogo
        socket.on(SocketEvents.JoinRoom, (data) => joinRoom(io, client, data));

        // Escolhe o quiz
        socket.on(SocketEvents.SetQuiz, (data) => setQuiz(io, client, data));

        // Afirma estar pronto
        socket.on(SocketEvents.Ready, (data) => ready(io, client, data));

        // Começa o jogo
        socket.on(SocketEvents.StartGame, (data) => startGame(io, client, data));

        // Lida com as respostas do jogador
        socket.on(SocketEvents.Answer, (data) => answer(io, client, data));

        // Avança para a próxima questão
        socket.on(SocketEvents.NextQuestion, (data) => nextQuestion(io, client, data));

        // Quando o jogador for desconectado
        socket.on(SocketEvents.ClientDisconnected, (data) => clientDisconnect(io, client, data));
    })
    } catch(err) {
        console.log('SOCKET ERROR!');
        console.log(err.name);
        console.log(err.message);
    }
}
