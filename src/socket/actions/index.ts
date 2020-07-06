import { Socket } from 'socket.io';
import { assertData } from '../middlewares';
import LoadGame from './loadGame';
import StartGame from './startGame';
import HandleAnswer from './handleAnswer';
import { APISocket } from 'src/@types';

export default {
    LoadGame,
    StartGame: (socket: APISocket, data: any) => appliedAssertation(socket, data, StartGame),
    HandleAnswer: (socket: APISocket, data: any) => appliedAssertation(socket, data, HandleAnswer),
}

// Aplica assertação de dados
async function appliedAssertation(socket: APISocket, data: any, cb: (socket: APISocket, data: any) => any) {
    const is_data_right = await assertData(socket);
    if (is_data_right)
        return cb(socket, data);
    else
        return (socket: APISocket, data: any) => {};
}