/* Listagem de eventos do jogo */
export const SocketEvents = {
    ClientConnect: "connect",
    ClientDisconnected: "disconnecting",
    GameError: "game-error",

    // Sala
    CreateRoom: "create-room",
    JoinRoom: "join-room",
    PlayerJoin: "player-join",
    LeaveRoom: "leave-room",
    PlayerLeave: 'player-leave',
    SetQuiz: "set-quiz",
    
    // Convites    
    RoomInvite: 'room-invite',
    InviteDeny: 'invite-deny',
    InviteAccept: 'invite-accept',    
    
    // Ciclo de jogo
    Ready: "ready",
    StartGame: "start-game",
    GameTimer: "game-timer",
    Answer: "answer",
    PlayerAnswered: "player-answered",
    EveryBodyAnswered: "every-body-answered",
    TimeOut: "time-out",
    NextQuestion: "next-question",
    QuestionData: "question-data",

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
    NotFriends: { name: 'not-friends', code: 13, message: "O usuário não é amigo do destinatário" }
}