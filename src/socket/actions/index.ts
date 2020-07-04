import { Socket } from 'socket.io';
import LoadGame from './loadGame';
import startGame from './startGame';
import handleAnswer from './handleAnswer';

export default {
    // StartGame
    LoadGame: LoadGame,
    StartGame: startGame,
    handleAnswer
}