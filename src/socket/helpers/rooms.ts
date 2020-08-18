import { SocketClient } from "./clients";

/**
 * Classe base para as salas que precedem os jogos da aplicação.
 */
export class Room {
    static rooms: { [id: string]: Room } = {};

    public players: Array<SocketClient>;
    public mainPlayer: SocketClient;

    /**
     * Lida com a desconexão de um usuário da sala
     */
    clientDisconnected(client: SocketClient) {
        
    }
    
    /**
     * Retorna uma sala
     */
    static getRoom(id: string) {
        return Room.rooms[id];
    }
}