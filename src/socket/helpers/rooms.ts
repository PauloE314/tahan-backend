import Match from './match';
import GameQuiz from './game';

interface RoomList {
    [key: string]: {
        match: Match,
        game?: GameQuiz
    }
}

const room_list: RoomList = {};


export default {
    // Retorna uma sala
    get_room(id: string) {
        return room_list[id];
    },
    // Muda o valor da sala
    set_room(id: string, data: { match: Match, game?: GameQuiz }) {
        room_list[id] = data;
    },
    // Apaga a sala
    delete_room(id: string) {
        if (room_list[id])
            delete room_list[id];
    },
    // Apaga a sala
    all_rooms() {
        return room_list;
    }
}