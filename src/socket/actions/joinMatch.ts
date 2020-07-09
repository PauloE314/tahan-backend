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


// Adiciona o usuário à sala passada como parâmetro
export default async function JoinMatch (io: Server, client: Client, data: { code: string }) {
    // Certifica que o usuário não está em outra sala
    if (client.match_room)
        return client.emitError(GameErrors.UserAlreadyInGame);

    // Adiciona o usuário à sala
    const matchExists = client.joinToExistentRoom(data.code);

    // Caso não exista um match com esse nome, retorna erro
    if (!matchExists)
        return client.emitError(GameErrors.MatchDoesNotExist);
        
    // Avisa a todos da sala
    client.io.to(data.code).emit(SocketEvents.PlayerJoin, client.user);
    
    
    // Caso o usuário seja disconectado
    client.on(SocketEvents.ClientDisconnected, async () => await handleMatchDisconect(client));
}
