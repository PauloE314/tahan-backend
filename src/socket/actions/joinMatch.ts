import { SocketEvents, GameErrors } from "@config/socket";
import { Server } from 'socket.io';
import Client from '../helpers/client';
import Match from '../helpers/match';


// Adiciona o usuário à sala passada como parâmetro
export default async function JoinMatch (io: Server, client: Client, data: { code: string }) {
    try {
    // Certifica que o usuário não está em outra sala
    if (client.match_code)
        return client.emitError(GameErrors.UserAlreadyInGame);

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
    
    console.log(`Match ${match.room_key} está com os players ${match.players.map(player => player.user.username)}`);
    
    // Caso o usuário seja disconectado
    client.on(SocketEvents.ClientDisconnected, () => {
        // Remove o usuário
        match.remove_player_2();
        // Avisa aos players (no caso só o player 1) sobre o ocorrido
        match.player_1.emit(SocketEvents.SecondaryPlayerOut);
    });
    }
    catch(err) {
        console.log(err.message);
    }
}
