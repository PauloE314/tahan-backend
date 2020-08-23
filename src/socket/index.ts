import { Server } from 'socket.io';
import { APISocket } from 'src/@types/socket';

import { useMiddlewares } from './middlewares';

import { SocketEvents } from '@config/socket';
import { socketAuth } from './middlewares/auth';
import { socketUserValidation } from './middlewares/validateUser';
import { SocketClient } from './helpers/clients';
import { clientDisconnect } from './actions/disconnect';
import { createRoom } from './actions/games/createRoom';
import { leaveRoom } from './actions/games/leaveRoom';
import { messagePrint } from 'src/utils';
import { joinRoom } from './actions/games/joinRoom';
import { setQuiz } from './actions/games/setQuiz';
import { ready } from './actions/games/ready';
import { startGame } from './actions/games/startGame';
import { answer } from './actions/games/answer';
import { nextQuestion } from './actions/games/nextQuestion';


/**
 * Função base de aplicação dos sistemas de socket para a permissão de jogos multiplayer.
 */
export function useSocket(io: Server) {
    // Aplica middlewares
    useMiddlewares(io, [socketAuth, socketUserValidation]);

    // Inicia a conexão
    try {
    io.on(SocketEvents.ClientConnect, (socket: APISocket) => {
        // Cria um cliente
        const client = new SocketClient(socket, socket.client.user);
        
        // Mensagem
        messagePrint(`[NOVO USUÁRIO]: username: ${client.user.username}, total de usuários: ${Object.keys(SocketClient.clients).length}`, 'green');

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
