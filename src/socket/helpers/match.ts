import Client from "./client";
import { get_random_value } from '../../utils'
import { Server } from "socket.io";

interface MatchList {
    [key: string]: Match
}

const match_list: MatchList = {};


export class Match {
    public key: string;
    public io: Server;
    public player_1: Client;
    public player_2?: Client;

    // Cria um novo match
    constructor(io: Server, player_1: Client) {
        const match_list_ids = Object.keys(match_list);
        this.key = `game-${get_random_value(4, match_list_ids)}`;
        this.io = io;
        this.player_1 = player_1;
        this.player_1.match_code = this.key;
        // Adiciona o jogador um ao Match
        this.player_1.joinNewRoom(this.key);
        // Salva as alterações
        this.update_match_list();
    }
    // Adiciona o jogador 2
    public add_player_2(player_2: Client) {
        // Salva o usuário
        this.player_2 = player_2;
        this.player_2.match_code = this.key;
        // Entra na sala
        this.player_2.joinToExistentRoom(this.key);

        return this.player_2;
    }
    // Remove o jogador 2
    public remove_player_2() {
        // Sai da sala
        this.player_2.socket.leave(this.key);
        // Zera o código
        this.player_2.match_code = null;
        // Remove o player
        this.player_2 = null;
    }
    // Atualiza o match na lista de matchs
    private update_match_list() {
        match_list[this.key] = this;
    }
    // Termina o match
    public end_match() {
        // Retira todos os membros do match da sala
        const sockets = this.io.of('/').connected;
        this.players.forEach(player => {
            player.match_code = undefined;
            if (sockets[player.socket.id])
                sockets[player.socket.id].leave(this.key);
        })

        // Deleta a sala da listagem
        delete match_list[this.key];
    }
    // Emite um evento para ambos os players
    public emit_to_players(event: string, data?: any, options?: { player_1: boolean, player_2: boolean }) {
        const to_player_1 = options ? options.player_1 : true;
        const to_player_2 = (options ? options.player_2 : true) && this.player_2;
        // Envia para ambos da sala
        if (to_player_1 && to_player_2) {
            return this.io.to(this.key).emit(event, data);
        }
        // Envia apenas para um dos players
        else {
            if (to_player_1)
                return this.io.to(this.player_1.socket.id).emit(event, data);
            if (to_player_2)
                return this.io.to(this.player_2.socket.id).emit(event, data);
        }
    }
    // Listagem de jogadores
    get players() {
        const players = [this.player_1];
        if (this.player_2)
            players.push(this.player_2);

        return players;
    }

    get all_ready() {
        const { players } = this;
        if (players.length !== 2)
            return false;
        
        else {
            const { connected } = this.io.of('/'); 
            return connected[this.player_1.socket.id] && connected[this.player_2.socket.id]
        }
    }

    // Pega um match
    public static get_match(id: string): null | Match {
        const match = match_list[id];
        return match ? match : null
    }
}