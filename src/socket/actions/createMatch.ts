import { SocketEvents, GameErrors } from "@config/socket";
import { Server } from 'socket.io';
import Client from '../helpers/client';
import Match from '../helpers/match';
import { CreateMatchData, MatchCreatedData } from "src/@types/socket";



export default async function createMatch (io: Server, client: Client, data: CreateMatchData){
    // Caso o usuário já esteja em um match
    if (client.match_code)
        return client.emitError(GameErrors.UserAlreadyInMatch);
        

    // Cria um match
    const match = new Match(io, client);
    // client.joinNewRoom(room_name);

    console.log(`Match ${match.room_key} está com os players ${match.players.map(player => player.user.username)}`);
    
    // Envia os dados do match
    const match_data: MatchCreatedData = { match_code: match.room_key };
    client.emit(SocketEvents.MatchCreated, match_data);

    // Caso o usuário se disconecte
    client.on(SocketEvents.ClientDisconnected, async () => {
        const match = Match.get_match(client.match_code);
        const oponent = match.players.find(player => player.user.id !== client.user.id);
        
        if (oponent)
            oponent.emit(SocketEvents.MainPlayerOut)
        // Termina o match
        match.end_match(io);
    });
}
