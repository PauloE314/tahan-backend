import path from 'path';

const image_path = path.resolve(__dirname, '..', '..', 'uploads');

export default {
    port: 3000,
    image_host: `http://localhost:3000/uploads/`,
    image_path,
    quizzes: {
        min_questions: 4,
        max_questions: Infinity,
        min_alternatives: 2,
        max_alternatives: 6,
    },


    secret_key: "zKRk85IqOdErrmR4",
    jwtTime: "3d"
}