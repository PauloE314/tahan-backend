import { Quizzes } from '@models/quiz/Quizzes';
import { getRepository, getCustomRepository } from 'typeorm';
import { SocketEvents, GameErrors } from "@config/socket";
import { Socket, Server } from 'socket.io';
import { Err } from 'src/utils/classes';
import { APISocket, Room } from 'src/@types';
// import JoinGame from './'
import { Games } from '@models/games/Games';
import GamesRepository from '@database/repositories/GamesRepo';
import Client, { handleMatchDisconect } from '../helpers/client';
import { Match } from '../helpers/match';


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

    console.log("Pegou o match: " + match.key);
    // Adiciona o usuário como player 2
    const player_2 = match.add_player_2(client);
    // Avisa a todos da sala
    match.emit_to_players(SocketEvents.PlayerJoin, player_2.user);
    
    console.log(`Match ${match.key} está com os players ${match.players.map(player => player.user.username)}`);
    
    // Caso o usuário seja disconectado
    client.on(SocketEvents.ClientDisconnected, () => {
        // Remove o usuário
        match.remove_player_2();
        // Avisa aos players (no caso só o player 1) sobre o ocorrido
        match.emit_to_players(SocketEvents.SecondaryPlayerOut);
    });
    }
    catch(err) {
        console.log(err.message);
    }
}
