import { Socket, Server } from 'socket.io';
import { assertData } from '../middlewares';
import LoadGame from './loadGame';
import CreateGame from './createGame';
import StartGame from './startGame';
import HandleAnswer from './handleAnswer';
import JoinGame from './joinGame';
import Ready from './Ready';
import { APISocket } from 'src/@types';
import { SocketErrors } from '@config/socket';

export default {
    LoadGame,
    StartGame,
    HandleAnswer,

    CreateGame,
    JoinGame,
    
    Ready
}