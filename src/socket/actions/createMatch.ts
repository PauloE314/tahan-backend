import { Quizzes } from '@models/quiz/Quizzes';
import { getRepository, getCustomRepository } from 'typeorm';
import { SocketEvents, GameErrors } from "@config/socket";
import { Socket, Server } from 'socket.io';
import { Err } from 'src/utils/classes';
import { APISocket, Room } from 'src/@types';
import { Games } from '@models/games/Games';
import Client, { handleMatchDisconect } from '../helpers/client';
import { getFullQuizData } from '../helpers/game';



export default async function createMatch (io: Server, client: Client, data: any){
    // Cria um "match"
    // Caso o usuário já esteja em um match
    if (client.match_room)
        return client.emitError(GameErrors.UserAlreadyInGame);
        

    // Cria um match
    const room_name = 'game-' + client.socket.id;
    // client.joinNewRoom(room_name);
    client.socket.join(room_name);

    console.log(client.match_room)
    
    // Envia os dados do match
    client.emit(SocketEvents.MatchCreated, { match_code: room_name });

    // Caso o usuário se disconecte
    client.on(SocketEvents.ClientDisconnected, async () => await handleMatchDisconect(client));
}
