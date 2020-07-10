import { Quizzes } from '@models/quiz/Quizzes';
import { getRepository, getCustomRepository } from 'typeorm';
import { SocketEvents, GameErrors } from "@config/socket";
import { Socket, Server } from 'socket.io';
import { Err } from 'src/utils/classes';
import { APISocket, Room } from 'src/@types';
import { Games } from '@models/games/Games';
import Client, { handleMatchDisconect } from '../helpers/client';
import { getFullQuizData } from '../helpers/game';
import { Match } from '../helpers/match';



export default async function createMatch (io: Server, client: Client, data: any){
    // Caso o usuário já esteja em um match
    if (client.match_code)
        return client.emitError(GameErrors.UserAlreadyInGame);
        

    // Cria um match
    const match = new Match(io, client);
    // client.joinNewRoom(room_name);

    console.log(`Match ${match.key} está com os players ${match.players.map(player => player.user.username)}`);
    
    // Envia os dados do match
    client.emit(SocketEvents.MatchCreated, { match_code: match.key });

    // Caso o usuário se disconecte
    client.on(SocketEvents.ClientDisconnected, async () => {
        const match = Match.get_match(client.match_code);
        match.emit_to_players(SocketEvents.MainPlayerOut)
        // Termina o match
        match.end_match();
    });
}
