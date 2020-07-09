import Client from "./client";

interface MatchList {
    [key: string]: Match
}

const match_list: MatchList = {};


export class Match {
    public room_key: string;
    public player_1: Client;
    public player_2?: Client;

    private player_1_ready: boolean;
    private player_2_ready: boolean;

    constructor(player_1: Client) {
        this.room_key = `gaming-${player_1.socket.id}`;
        this.player_1 = player_1;
        // Adiciona o jogador um ao Match
        this.player_1.joinNewRoom(this.room_key);
    }

    addPlayer(player_2: Client) {
        
    }

    get p1_ready() {
        return this.player_1_ready;
    }

    get p2_ready() {
        return this.player_2_ready && this.player_2;
    }
}