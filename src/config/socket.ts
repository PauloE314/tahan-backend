/* Listagem de eventos do jogo */
export const SocketEvents = {
    // Eventos do cliente
    ClientConnect: 'connect',
    CreateMatch: 'create-match',
    JoinMatch: 'join-match',
    Ready: 'ready',
    StartGame: 'start-game',
    Answer: 'answer',
    ClientDisconnected: 'disconnecting',

    // Eventos do server
    GameError: 'game-error',
    MatchCreated: 'match-created',
    MatchJoined: 'match-joined',
    PlayerJoin: 'player-join',
    OponentReady: 'oponent-ready',
    MainPlayerOut: 'main-player-out',
    SecondaryPlayerOut: 'secondary-player-out',
    GameData: 'game-data',
    GameStartCounter: 'game-start-counter',
    // Cíclo
    NextQuestion: 'next-question',
    AnswerCounter: 'answer-counter',  
    OponentAnswered: 'oponent-answered',
    RightAnswer: 'right-answer',
    WrongAnswer: 'wrong-answer',
    BothAnswered: 'both-answered',
    TimeOut: 'time-out',
    EndGame: 'end-game',
    OponentOut: 'oponent-out',
};


/* Listagem de estados do jogo */
export const GameStates = {
    Begin: 'begin',
    Playing: 'playing',
    BeforeEnd: 'before-end',
    Ended: 'ended'
};


/* Modelo de erro */
export interface GameErrorModel {
    name: string,
    code: number,
    message: string
}
/* Listagem de erros */
export const GameErrors = {
    PermissionDenied: { name: 'permission-denied', code: 0, message: 'O usuário não tem permissão para essa ação'},
    DoubleUser: { name: 'double-user', code: 1, message: 'Já existe outro cliente usando essa conta'},
    UserDoesNotExist: { name: 'user-does-not-exist', code: 2, message: 'Usuário não existe' },
    GameDoesNotExist: { name: 'game-does-not-exist', code: 3, message: 'O Jogo não existe' },
    MatchDoesNotExist: { name: 'match-does-not-exist', code: 4, message: 'Essa sessão de jogo não existe' },
    QuizDoesNotExist: { name: 'quiz-does-not-exist', code: 5, message: 'O Quiz não existe' },
    InvalidAction: { name: 'invalid-action', code: 6, message: 'Ação inválida para esse estágio do jogo' },
    RoomIsFull: { name: 'room-is-full', code: 7, message: 'Esse jogo já possui 2 jogadores' },
    RoomIsEmpty: { name: 'room-is-empty', code: 8, message: 'Esse jogo está vazio' },
    RoomIncomplete: { name: 'room-incomplete', code: 9, message: 'Esse match não está completo' },
    UserAlreadyInMatch: { name: 'user-in-match', code: 10, message: 'O usuário já está em um match' },
    UserNotInMatch: { name: 'user-not-in-match', code: 11, message: 'O usuário não está em um match' },
    UserAlreadyInGame: { name: 'user-in-game', code: 12, message: 'O usuário ainda está em jogo' },
    UserNotInGame: { name: 'user-not-in-game', code: 13, message: 'O usuário não está participando do jogo'},
}