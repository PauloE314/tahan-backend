import { Server } from "socket.io";
import { SocketClient } from "../helpers/clients";
import { GameExceptions, SocketEvents } from "@config/socket";
import { getRepository } from "typeorm";
import { Quizzes } from "@models/quiz/Quizzes";
import { messagePrint } from "src/utils";

/**
 * Ação que permite o jogador principal escolher um quiz. Os quizzes são armazenados nas salas se jogo, mas logo são migradas para uma instância real que representa um jogo ativo.
 */
export async function setQuiz(io: Server, client: SocketClient, data?: any) {
    try {
        // Aplica validação de quiz
        const { room, quizId, quiz } = await setQuizValidation(io, client, data);
    
        // Limpa o quiz da sala
        if (quizId === -1) {
            messagePrint(`[LIMPAGEM DE QUIZ DA SALA]: roomId: ${room.id}, total de clientes na sala: ${room.clientList.length}`);
    
            room.quiz = undefined;
    
            // Envia dados do quiz para todos
            return room.sendToAll(io, SocketEvents.QuizData, null);
        }

        // Armazena o quiz
        room.quiz = quiz;
    
        messagePrint(`[ESCOLHA DE QUIZ]: quizId: ${quiz.id}, roomId: ${room.id}, total de clientes na sala: ${room.clientList.length}`);
    
        // Serializa o quiz
        const { questions, ...serializedData } = quiz;
    
        // Envia dados do quiz para todos
        return room.sendToAll(io, SocketEvents.QuizData, serializedData);
        
    // Lida com possíveis erros
    } catch (error) {
        if (error.name !== SocketEvents.GameError)
            throw error;  
    }
}

/**
 * Valida a escolha de um quiz
 */
async function setQuizValidation(io: Server, client: SocketClient, data?: any) {
    const { room } = client;
    const quizId = data ? data.id : undefined;
    
    // Certifica que o cliente está em uma sala, é o principal e não está em jogo
    if (!room) 
        client.emitError(GameExceptions.RoomDoesNotExist).raise();

    // Certifica que ele não está em jogo
    if (client.inGame) 
        client.emitError(GameExceptions.UserAlreadyInGame).raise();

    // Certifica que é o cliente principal
    if (client.user.id !== room.mainClient.user.id) 
        client.emitError(GameExceptions.PermissionDenied).raise();

    // Permite limpeza de quiz
    if (quizId === -1)
        return { room, quizId, quiz: null };

    // Certifica que o quiz existe
    const quiz = await getRepository(Quizzes).findOne({
        where: { id: quizId, mode: 'public'},
        relations: ['author', 'questions', 'questions.alternatives', 'questions.rightAnswer']
    });
    if (!quiz)
        client.emitError(GameExceptions.QuizDoesNotExist).raise();


    return { room, quiz, quizId };
}