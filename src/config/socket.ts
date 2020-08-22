/* Listagem de eventos do jogo */
export const SocketEvents = {
    ///------------- Eventos do cliente -------------//
    ClientConnect: "connect",
    ClientDisconnected: "disconnecting",

    // Ações com a sala
    CreateRoom: "create-room",
    LeaveRoom: "leave-room",
    JoinRoom: "join-room",
    SetQuiz: "set-quiz",
    Ready: "ready",
    StartGame: "start-game",
    Answer: "answer",
    NextQuestion: "next-question",

    //------------- Eventos do server -------------//
    GameError: "game-error",
    
    // Respostas da sala
    RoomCreated: "room-created",
    RoomLeaved: "room-leaved",
    RoomJoined: "room-joined",
    PlayerJoin: "player-join",
    PlayerLeaveRoom: "player-leave-room",
    QuizData: "quiz-data",
    PlayerReady: "player-ready",
    GameStart: "game-start",

    // Ciclo de jogo
    GameTimer: "game-timer",
    TimeOut: "time-out",
    RightAnswer: "right-answer",
    WrongAnswer: "wrong-answer",
    PlayerAnswered: "player-answered",
    QuestionData: "question-data",  
    EveryBodyAnswered: "every-body-answered",
    EndGame: "end-game",
};

/* Listagem de erros */
export const GameExceptions = {
    PermissionDenied: { name: "permission-denied", code: 0, message: "O usuário não tem permissão para essa ação"},
    DoubleUser: { name: "double-user", code: 1, message: "Já existe outro cliente usando essa conta"},
    UserDoesNotExist: { name: "user-does-not-exist", code: 2, message: "Usuário não existe" },
    CantCreateRoom: { name: "cant-create-room", code: 3, message: "Não foi possível criar a sala" },
    RoomDoesNotExist: { name: "room-does-not-exist", code: 4, message: "A sala não existe" },
    UserAlreadyInRoom: { name: "user-in-room", code: 5, message: "O usuário já está em uma sala" },
    RoomIsFull: { name: "room-is-full", code: 6, message: "A sala já está com todos os jogadores" },
    InvalidAction: { name: "invalid-action", code: 7, message: "Ação inválida para esse estágio da aplicação" },
    QuizDoesNotExist: { name: "quiz-does-not-exist", code: 8, message: "O Quiz não existe" },
    UserAlreadyInGame: { name: "user-in-game", code: 9, message: "O usuário ainda está em jogo" },
    RoomIncomplete: { name: "room-incomplete", code: 10, message: "A sala não está completa" },

    NotAllReady: { name: 'not-all-ready', code: 11, message: "Ainda há usuários que não estão prontos"},
    GameDoesNotExist: { name: "game-does-not-exist", code: 12, message: "O jogo não existe" },
}