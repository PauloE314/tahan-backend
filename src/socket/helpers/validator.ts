import { GameExceptions } from "@config/socket";
import { SocketClient } from "./clients";
import { Room } from "./rooms";
import { Game } from "./games";

type TConditionalOutput<MainType, T> = T extends true? MainType : (T extends false? false : never)


/**
 * Certifica se o usuário está em uma sala. Obriga o estado do usuário (se ele está em uma sala ou não) a ser o valor passado como parâmetro.
 */
export function clientIsInRoom<T extends boolean>(client: SocketClient, itIs: T, raiseError = true): TConditionalOutput<Room, T> {
    const { inRoom } = client;

    // Checa se a sala existe
    if (!inRoom && itIs) {
        const exception = client.emitError(GameExceptions.RoomDoesNotExist);

        // Ativa o erro
        if (raiseError)
            throw exception.error;
    }

    // Checa se a sala não existe
    if (inRoom && !itIs) {
        const exception = client.emitError(GameExceptions.UserAlreadyInRoom);

        // Ativa o erro
        if (raiseError)
            throw exception.error;
    }

    return inRoom as TConditionalOutput<Room, T>;
}

/**
 * Certifica se o usuário está em um jogo. Obriga o estado do usuário (se ele está em um jogo ou não) a ser o valor passado como parâmetro. Caso não seja, ocorre um erro.
 */
export function clientIsInGame<T extends boolean>(client: SocketClient, itIs: T, raiseError = true): TConditionalOutput<Game, T> {
    const { inGame } = client;

    // Checa se o jogo existe
    if (!inGame && itIs) {
        const exception = client.emitError(GameExceptions.GameDoesNotExist);

        // Ativa o erro
        if (raiseError)
            throw exception.error;
    }

    // Checa se o jogo não existe
    if (inGame && !itIs) {
        const exception = client.emitError(GameExceptions.UserAlreadyInGame);

        // Ativa o erro
        if (raiseError)
            throw exception.error;
    }

    return inGame as TConditionalOutput<Game, T>;
}


/**
 * Certifica que o usuário é o jogador principal de uma sala
 */
export function clientIsMainPlayer(client: SocketClient, room: Room, raiseError = true) {
    // Checa se o cliente é o principal
    if (client.user.id !== room.mainClient.user.id) {
        const exception = client.emitError(GameExceptions.PermissionDenied);

        // Ativa o erro
        if (raiseError)
            throw exception.error;
    }
    return;
}