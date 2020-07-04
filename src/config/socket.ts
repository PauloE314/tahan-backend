export const SocketEvents = {
    // Eventos do cliente
    ClientConnect: 'connect',
    LoadGame: 'load-game',
    StartGame: 'start-game',
    GetQuestion: 'get-question',
    Answer: 'answer',
    ClientDisconnected: 'disconnect',

    // Eventos do server
    QuizData: 'quiz-data',
    NextQuestion: 'next-question',
    RightAnswer: 'right-answer',
    WrongAnswer: 'wrong-answer',
    Exception: "error"
};

export const SocketErrors = {
    BaseErrorName: 'APIError',
    PermissionDenied: 'permission-denied',
    QuizNotFound: 'quiz-not-found'
}