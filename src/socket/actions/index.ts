import { Socket, Server } from 'socket.io';
import CreateMatch from './createMatch';
import JoinMatch from './joinMatch';
import Ready from './Ready';
import { APISocket } from 'src/@types';

export default {
    CreateMatch,
    JoinMatch,
    Ready
}