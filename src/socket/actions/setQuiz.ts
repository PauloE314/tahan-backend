import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { GameExceptions, SocketEvents } from "@config/socket";
import { getRepository } from "typeorm";
import { Quizzes } from "@models/quiz/Quizzes";
import { messagePrint } from "src/utils";
import { clientIsInRoom, clientIsInGame, clientIsMainPlayer } from "../helpers/validator";

/**
 * Ação que permite o jogador principal escolher um quiz. Os quizzes são armazenados nas salas se jogo, mas logo são migradas para uma instância real que representa um jogo ativo.
 */
export async function setQuiz(io: Server, client: SocketClient, data?: any) {
    try {
        const quizId = data ? data.id : undefined;

        // Certifica que o jogador está em uma sala, não está em um jogo e que é o jogador principal
        const room = clientIsInRoom(client, true);
        clientIsInGame(client, false);
        clientIsMainPlayer(client, room);
    
        // Limpa o quiz da sala
        if (quizId === -1) {
            messagePrint(`[LIMPAGEM DE QUIZ DA SALA]: roomId: ${room.id}, total de clientes na sala: ${room.clients.length}`);
    
            room.quiz = undefined;
    
            // Envia dados do quiz para todos
            return room.sendToAll(io, SocketEvents.QuizData, null);
        }
    
        // Pega o quiz e seus dados
        const quiz = await getRepository(Quizzes).findOne({
            where: { id: quizId },
            relations: ['author', 'questions', 'questions.alternatives', 'questions.rightAnswer']
        });
    
        // Certifica que o quiz existe
        if (!quiz)
            return client.emitError(GameExceptions.QuizDoesNotExist);
    
        // Armazena o quiz
        room.quiz = quiz;
    
        messagePrint(`[ESCOLHA DE QUIZ]: quizId: ${quiz.id}, roomId: ${room.id}, total de clientes na sala: ${room.clients.length}`);
    
        // Serializa o quiz
        const { questions, ...serializedData } = quiz;
    
        // Envia dados do quiz para todos
        room.sendToAll(io, SocketEvents.QuizData, serializedData);
        
        return;
        
    // Lida com possíveis erros
    } catch (error) {
        if (error.name !== SocketEvents.GameError)
            throw error;  
    }
}