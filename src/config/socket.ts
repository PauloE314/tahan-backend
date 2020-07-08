export const SocketEvents = {
    // Eventos do cliente
    ClientConnect: 'connect',
    LoadGame: 'load-game',
    Creategame: 'create-game',
    JoinGame: 'join-game',
    Ready: 'ready',
    StartGame: 'start-game',
    GetQuestion: 'get-question',
    Answer: 'answer',
    ClientDisconnected: 'disconnecting',

    // Eventos do server
    PlayerJoin: 'player-join',
    GameData: 'game-data',
    NextQuestion: 'next-question',
    RightAnswer: 'right-answer',
    WrongAnswer: 'wrong-answer',
    Exception: "error",
    TimerToNextQuestion: 'timer-to-next-question',
    TimerToAnswer: 'timer-to-answer',
    TimeOut: 'time-out',
    EndGame: 'end-game'
};



export const GameStates = {
    Begin: 'begin',
    Playing: 'playing',
    Ended: 'ended'
};



export interface GameErrorModel {
    name: string,
    code: number,
    message: string
}

export const GameErrors = {
    PermissionDenied: { name: 'permission-denied', code: 0, message: 'O usuário não tem permissão para essa ação'},
    UserDoesNotExist: { name: 'user-does-not-exist', code: 1, message: 'Usuário não existe' },
    GameDoesNotExist: { name: 'game-does-not-exist', code: 2, message: 'O Jogo não existe' },
    QuizDoesNotExist: { name: 'quiz-does-not-exist', code: 3, message: 'O Quiz não existe' },
    InvalidAction: { name: 'invalid-action', code: 4, message: 'Ação inválida para esse estágio do jogo' },
    RoomIsFull: { name: 'room-is-full', code: 5, message: 'Esse jogo já possui 2 jogadores' },
    RoomIsEmpty: { name: 'room-is-empty', code: 6, message: 'Esse jogo está vazio' },
    UserAlreadyInGame: { name: 'user-in-game', code: 7, message: 'O usuário ainda está em jogo' },
    UserNotInGame: { name: 'user-not-in-game', code: 8, message: 'O usuário não está participando do jogo'}    
}