/* Listagem de eventos do jogo */
export const SocketEvents = {
    ///------------- Eventos do cliente -------------//
    ClientConnect: "connect",

    // Ações com a sala
    CreateRoom: "create-room",
    LeaveRoom: "leave-room",
    JoinRoom: "join-room",
    SetQuiz: "set-quiz",
    Ready: "ready",


    StartGame: "start-game",
    Answer: "answer",
    ClientDisconnected: "disconnecting",


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

    

    MainPlayerOut: "main-player-out",
    SecondaryPlayerOut: "secondary-player-out",

    // Cíclo
    NextQuestion: "next-question",
    AnswerCounter: "answer-counter",  
    OponentAnswered: "oponent-answered",
    RightAnswer: "right-answer",
    WrongAnswer: "wrong-answer",
    BothAnswered: "both-answered",
    TimeOut: "time-out",
    EndGame: "end-game",
    OponentOut: "oponent-out",
};


/* Listagem de estados do jogo */
export const GameStates = {
    Begin: "begin",
    Playing: "playing",
    BeforeEnd: "before-end",
    Ended: "ended"
};

/* Listagem de erros */
export const GameExceptions = {
    PermissionDenied: { name: "permission-denied", code: 0, message: "O usuário não tem permissão para essa ação"},
    DoubleUser: { name: "double-user", code: 1, message: "Já existe outro cliente usando essa conta"},
    UserDoesNotExist: { name: "user-does-not-exist", code: 2, message: "Usuário não existe" },
    CantCreateRoom: { name: "cant-create-room", code: 3, message: "Não foi possível criar a sala" },
    RoomDoesNotExist: { name: "room-does-not-exist", code: 4, message: "A sala não existe" },
    UserAlreadyInRoom: { name: "user-in-room", code: 5, message: "O usuário já está em uma sala" },
    RoomIsFull: { name: "room-is-full", code: 6, message: "Esse jogo já possui 2 jogadores" },
    InvalidAction: { name: "invalid-action", code: 7, message: "Ação inválida para esse estágio da aplicação" },
    QuizDoesNotExist: { name: "quiz-does-not-exist", code: 8, message: "O Quiz não existe" },
    UserAlreadyInGame: { name: "user-in-game", code: 9, message: "O usuário ainda está em jogo" },


    GameDoesNotExist: { name: "game-does-not-exist", code: 3, message: "O Jogo não existe" },
    MatchDoesNotExist: { name: "match-does-not-exist", code: 4, message: "Essa sessão de jogo não existe" },
    RoomIsEmpty: { name: "room-is-empty", code: 8, message: "Esse jogo está vazio" },
    RoomIncomplete: { name: "room-incomplete", code: 9, message: "Esse match não está completo" },
    UserNotInMatch: { name: "user-not-in-match", code: 11, message: "O usuário não está em um match" },
    UserNotInGame: { name: "user-not-in-game", code: 13, message: "O usuário não está participando do jogo"},
}