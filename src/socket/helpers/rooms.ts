import Match from './match';
import GameQuiz from './game';

interface Room {
    match: Match,
    game?: GameQuiz
}

interface RoomList {
    [key: string]: Room
}

// Lista das salas
const room_list: RoomList = {};


export default {
    // Retorna uma sala
    get_room(id: string) {
        return room_list[id];
    },
    // Muda o valor da sala
    set_room(id: string, data: (room: Room | undefined) => Room ) {
        room_list[id] = data(room_list[id]);
    },
    // Apagar apenas o jogo
    delete_game(id: string) {
        const room = room_list[id];
        if (room) {
            if (room.game)  {
                room.game.timmer.stop_timmer();
                delete room_list[id].game;
            }
        }
    },
    // Apaga a sala
    delete_room(id: string) {
        const room = room_list[id];
        if (room) {
            if (room.game) {
                room.game.timmer.stop_timmer();
                this.delete_game(id);
            }
            delete room_list[id];
        }
    },
    // retorna lista de salas
    all_rooms() {
        return room_list;
    },

    room_status() {
        const rooms = Object.keys(room_list);
        console.log('Salas: \n');

        rooms.forEach(room_id => {
            const room = room_list[room_id];
            const player_1 = room.match.player_1.user.username;
            const player_2 = room.match.player_2 ? room.match.player_2.user.username : null;


            console.log('   room_id: ' + room_id);
            console.log('   users: ' + player_1 + ', ' + player_2);
            console.log('   ' + (room.game ? 'estão jogando' : 'não estão jogando'));
            console.log('-----------------');
        })
    }
}