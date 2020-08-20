import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { messagePrint } from "src/utils";

/**
 * Ação de jogo que lida com a desconexão do jogador em tempo real. Através de uma cascata de ações todas as entidades ficam sabendo da desconexão e lidam com ela de forma apropriada. 
 */
export async function clientDisconnect(io: Server, client: SocketClient, data: any) {
    const { room } = client;

    // Retira o usuário da sala
    if (room) 
        await room.clientLeaveRoom(io, client);
    
    // Desconecta o usuário
    client.disconnect(io);

    // Mensagem
    messagePrint(`[CLIENTE DESCONECTADO]: username: ${client.user.username}, total de usuários: ${Object.keys(SocketClient.clients).length}`, 'red');
}