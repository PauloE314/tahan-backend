import { Room } from "./rooms";
import { SocketClient } from "./clients";
import { Quizzes } from "@models/quiz/Quizzes";

/**
 * Classe base para os jogos da aplicação. Os jogos são quizzes pensados para o multiplayer e tempo real.
 */
export class Game {
    static games: { [roomId: string]: Game } = {};

    public gameRoomId: string;
    public players: Array<SocketClient>;
    public quiz: Quizzes;

    get gameRoom() { return Room.getRoom(this.gameRoomId) }

    /**
     * Retorna um jogo
     */
    getGame(roomId: string) {
        return Game.games[roomId];
    }
}