import Client from "./client";
import { get_random_value } from '../../utils';
import { Server } from "socket.io";
import rooms_manager from './rooms';


export default class Match {
    public room_key: string;
    public player_1: Client;
    public player_2?: Client;

    // Cria um novo match
    constructor(io: Server, player_1: Client) {
        const match_list_ids = Object.keys(rooms_manager.all_rooms());
        this.room_key = `game-${get_random_value(4, match_list_ids)}`;
        this.player_1 = player_1;
        this.player_1.room_key = this.room_key;
        // Adiciona o jogador um ao Match
        this.player_1.joinNewRoom(io, this.room_key);

        rooms_manager.set_room(this.room_key, () => ({ match: this }));
    }
    // Adiciona o jogador 2
    public add_player_2(io: Server, player_2: Client) {
        // Salva o usuário
        this.player_2 = player_2;
        this.player_2.room_key = this.room_key;
        // Entra na sala
        this.player_2.joinToExistentRoom(io, this.room_key);

        return this.player_2;
    }
    // Remove o jogador 2
    public remove_player_2() {
        // Sai da sala
        this.player_2.socket.leave(this.room_key);
        // Zera o código
        this.player_2.room_key= null;
        // Remove o player
        this.player_2 = null;
    }
    // Termina o match
    public end_match(io: Server) {
        // Retira todos os membros do match da sala
        const sockets = io.of('/').connected;
        this.players.forEach(player => {
            player.room_key = undefined;
            if (sockets[player.socket.id])
                sockets[player.socket.id].leave(this.room_key);
        })

        // Deleta a sala da listagem
        console.log('END_MATCH: Deletando sala');
        rooms_manager.delete_room(this.room_key);

        const survived = [];
        const all_rooms = rooms_manager.all_rooms();
        for (let room in all_rooms) {
            survived.push('match: ' + all_rooms[room].match.room_key);
        }
        console.log('matchs:')
        console.log(survived);
    }
    // Emite um evento para ambos os players

    // Checa se um dado cliente é um player. Também pode checar se é o player 1 ou o 2
    public is_player(client: Client, specific?: 'player_1' | 'player_2') {
        const player_id_list = this.players.map(player => player.user.id);

        if (!specific)
            return player_id_list.includes(client.user.id);

        else if (specific === 'player_1')
            return this.player_1.user.id == client.user.id;

        else if (specific === 'player_2')
            return this.player_2.user.id == client.user.id;
    }

    // Checa se os jogadores estão hábeis para jogar
    public all_ready(io: Server) {
        const { players } = this;
        if (players.length !== 2)
            return false;
        
        else {
            const { connected } = io.of('/');
            if (connected[this.player_1.socket.id] && connected[this.player_2.socket.id])
                return true
        }
    }

    get room() {
        return rooms_manager.get_room(this.room_key);
    }

    
    // Listagem de jogadores
    get players() {
        const players = [this.player_1];
        if (this.player_2)
            players.push(this.player_2);

        return players;
    }

    // Pega um match
    public static get_match(id: string): null | Match {
        const room = rooms_manager.get_room(id) || { match: null};
        const { match } = room;
        return match ? match : null
    }
}