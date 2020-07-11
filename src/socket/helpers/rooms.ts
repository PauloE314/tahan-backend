import Match from './match';
import GameQuiz from './game';

interface Room {
    match: Match,
    game?: GameQuiz
}

interface RoomList {
    [key: string]: Room
}

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
    delete_game(id: string) {
        if (room_list[id]) {
            if (room_list[id].game) {
                delete room_list[id].game;
                console.log('Todos os jogos')
                console.log(
                    Object.keys(room_list)
                        .filter(id => room_list[id].game)
                )
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
    // Apaga a sala
    all_rooms() {
        return room_list;
    }
}