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
    const quizId = data ? data.id : undefined;
    const { room } = client;

    // Certifica que o cliente está em uma sala
    if (!room)
        return client.emitError(GameExceptions.RoomDoesNotExist);

    // Certifica que o cliente é o cliente principal
    if (room.mainClient.user.id !== client.user.id)
        return client.emitError(GameExceptions.PermissionDenied);

    // Certifica que o cliente não está em jogo
    if (client.inGame)
        return client.emitError(GameExceptions.UserAlreadyInGame);

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
}