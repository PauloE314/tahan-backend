export default {
    port: 3000,
    defaultPagination: 5,
    cryptTimes: 10,
    generateRandomTimes: 10000,
    security: {
        cryptTimes: 10,
        secretKey: "zKRk85IqOdErrmR4",
        jwtTime: "365d"
    },
    posts: {
        minTitleSize: 5
    },
    postContainers: {
        minNameSize: 5
    },
    quizzes: {
        minNameSize: 5,
        minPasswordSize: 5,

        minQuestions: 4,
        maxQuestions: Infinity,
        minAlternatives: 2,
        maxAlternatives: 6,

        // Socket
        time_to_next_question: 5,
        time_to_answer: 30
    },
    socket: {
        timeToNextQuestion: 5,
        timeToAnswer: 30
    }
}


export const codes = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    PERMISSION_DENIED: 401,
    SERVER_ERROR: 500
}