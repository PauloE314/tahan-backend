import { SocketEvents, GameErrors } from "@config/socket";
import { Server } from 'socket.io';
import Client, { client_status } from '../helpers/client';
import Match from '../helpers/match';
import { CreateMatchData, MatchCreatedData } from "src/@types/socket";
import rooms_manager from "../helpers/rooms";



export default async function createMatch (io: Server, client: Client, data: CreateMatchData){
    // Caso o usuário já esteja em um match
    if (client.room_key)
        return client.emitError(GameErrors.UserAlreadyInMatch);
        
    // Cria um match
    const match = new Match(io, client);

    // Envia os dados do match
    const match_data: MatchCreatedData = { match_code: match.room_key };
    client.emit(SocketEvents.MatchCreated, match_data);
    console.log(match.room_key);

    // Caso o usuário principal se disconecte
    client.on(SocketEvents.ClientDisconnected, async () => {
        // Caso eles não estejam em jogo
        if (!match.room.game) {
            // Apaga o match
            const match = Match.get_match(client.room_key);
            const oponent = match.players.find(player => player.user.id !== client.user.id);
            
            if (oponent)
                oponent.emit(SocketEvents.MainPlayerOut)
    
            // Termina o match
            match.end_match(io);
        }
    });
}
