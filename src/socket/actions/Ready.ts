import { SocketEvents, GameErrors } from "@config/socket";
import { ReadyData } from 'src/@types/socket';
import { Server } from 'socket.io';
import Client from '../helpers/client';
import Match from '../helpers/match';

// Adiciona o usuário à sala passada como parâmetro
export default async function Ready (io: Server, client: Client, data: ReadyData) {
    // Checa se o usuário está em um jogo
    if (!client.room_key)
        return client.emitError(GameErrors.UserNotInGame)
    
    const match = Match.get_match(client.room_key);
    // Checa se o match já tem os dois jogadores
    if (!match.all_ready(io))
        return client.emitError(GameErrors.RoomIncomplete);

    // Checa se ele realmente está em jogo
    if (!match.is_player(client))
        return client.emitError(GameErrors.UserNotInGame);
    // Emite ao oponente que ele está pronto
    const oponent = match.players.find(player => player.user.id !== client.user.id)
    oponent.emit(SocketEvents.OponentReady)
    
}
