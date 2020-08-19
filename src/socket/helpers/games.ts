import { Room } from "./rooms";
import { SocketClient } from "./clients";
import { Quizzes } from "@models/quiz/Quizzes";
import { Server } from "socket.io";

/**
 * Classe base para os jogos da aplicação. Os jogos são quizzes pensados para o multiplayer e tempo real.
 */
export class Game {
    static games: { [gameId: string]: Game } = {};

    public roomId: string;
    public players: Array<SocketClient>;
    public quiz: Quizzes;

    get room() { return Room.getRoom(this.roomId) }

    constructor(room: Room) {
        this.roomId = room.id;

        // Salva jogo
        Game.games[this.roomId] = this;
    }

    /**
     * Lista com a saída de um dos jogadores
     */
    async clientLeave(player: SocketClient, io: Server) {

    }

    /**
     * Retorna um jogo
     */
    static getGame(gameId: string) {
        return Game.games[gameId];
    }
    /**
     * Apaga jogo
     */
    static removeGame(gameId: string) {
        delete Game.games[gameId];
    }
}