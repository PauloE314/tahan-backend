import path from 'path';

const image_path = path.resolve(__dirname, '..', '..', 'uploads');

export default {
    port: 3000,
    image_host: `http://localhost:3000/uploads/`,
    image_path,
    default_pagination: 5,
    posts: {
        min_title_size: 5
    },
    quizzes: {
        min_questions: 4,
        max_questions: Infinity,
        min_alternatives: 2,
        max_alternatives: 6,
        // Socket
        time_to_next_question: 5,
        time_to_answer: 30
    },

    secret_key: "zKRk85IqOdErrmR4",
    jwtTime: "365d"
}


export const codes = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
}