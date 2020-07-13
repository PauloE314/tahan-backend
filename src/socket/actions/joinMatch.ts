import { SocketEvents, GameErrors } from "@config/socket";
import { Server } from 'socket.io';
import Client from '../helpers/client';
import Match from '../helpers/match';
import { JoinMatchData } from "src/@types/socket";
import rooms_manager from "../helpers/rooms";


// Adiciona o usuário à sala passada como parâmetro
export default async function JoinMatch (io: Server, client: Client, data: JoinMatchData) {
    // Certifica que o usuário não está em outra sala
    if (client.room_key)
        return client.emitError(GameErrors.UserAlreadyInMatch);

    const match = Match.get_match(data.code);
    
    // Verifica se existe um Match com esse código
    if (!match)
        return client.emitError(GameErrors.MatchDoesNotExist);

    // Certifica que o match não está cheio
    if (match.all_ready(io))
        return client.emitError(GameErrors.RoomIsFull);

    // Adiciona o usuário como player 2
    const player_2 = match.add_player_2(io, client);
    // Avisa ao jogador 1
    match.player_1.emit(SocketEvents.PlayerJoin, player_2.user);
    // Avisa ao jogador 2
    match.player_2.emit(SocketEvents.MatchJoined);
    
    // Caso o usuário seja disconectado
    client.on(SocketEvents.ClientDisconnected, () => {
        const room = rooms_manager.get_room(client.room_key);
        // Caso a sala não exista mais, para a função
        if (!room)
            return;
        // Caso não esteja ocorrendo um jogo
        if (!room.game) {
            // Remove o player 2
            room.match.remove_player_2();
            // Avisa ao player 1 sobre o ocorrido
            room.match.player_1.emit(SocketEvents.SecondaryPlayerOut);
        }
    });
}
