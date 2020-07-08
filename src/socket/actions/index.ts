import { Socket, Server } from 'socket.io';
import { assertData } from '../middlewares';
import CreateGame from './createGame';
import JoinGame from './joinGame';
import Ready from './Ready';
import { APISocket } from 'src/@types';
import { SocketErrors } from '@config/socket';

export default {
    CreateGame,
    JoinGame,
    Ready
}