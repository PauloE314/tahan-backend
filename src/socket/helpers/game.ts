import Client from "./client";
import { Quizzes } from "@models/quiz/Quizzes";
import { GameErrors, GameStates, SocketEvents, GameErrorModel } from "@config/socket";
import { Questions } from "@models/quiz/Questions";
import { Server } from "socket.io";
import { Games } from "@models/games/Games";
import { getRepository } from "typeorm";
import Match from "./match";
import rooms_manager from './rooms';
import { random_array } from "src/utils";

type PlayerAnswer =  'right' | 'wrong' | null;


interface GameQuestions {
    question: Questions,
    player_1: PlayerAnswer,
    player_2: PlayerAnswer
};

interface GameEndStatus {
    winner?: Client;
    draw: boolean;
}

// Modelo de jogo
export default class GameQuiz {
    public room_key: string
    public game_state: string;
    public quiz: Quizzes;
    public game_questions: Array<GameQuestions>;
    public current_question_index: number;


    constructor(match: Match, quiz: Quizzes) {
        this.quiz = quiz;
        this.room_key = match.room_key;
        this.game_state = GameStates.Begin;
        
        const { questions } = quiz;
        // Randomiza as questões do quiz
        const random_questions = random_array(questions);
        this.game_questions = random_questions.map(question => ({ question, player_1: null, player_2: null }));

        // Salva o game na sala
        rooms_manager.set_room(this.room_key, { match, game: this })
    }

    // Começa o jogo
    public startGame() {
        this.game_state = GameStates.Playing;
    }

    // Retorna uma nova questão
    public nextQuestion(onEnd: () => any): Questions | GameEndStatus{
        // assegura que o jogo está ocorrendo
        if (this.game_state !== GameStates.Playing)
            return;
        // Checa se ainda há questões para responder
        if (this.current_question_index === this.game_questions.length) {
            onEnd();
            return this.endGame();
        }

        // Avança um índice
        this.current_question_index++;

        // Retorna a qestão
        return this.game_questions[this.current_question_index].question;
    }

    // Lida com a resposta
    public answerQuestion(client: Client, answer_id: number, onBothAnswered?: (data: { player1_answer: PlayerAnswer, player2_answer: PlayerAnswer }) => void) {
        // Checa se o jogo está ocorrendo
        if (this.game_state !== GameStates.Playing)
            return;
        
        // Checa se a resposta está correta
        const answer_state: PlayerAnswer = answer_id === this.current_question.question.rightAnswer.id ? 'right' : 'wrong';
        // Armazena a resposta
        const player_how_answered = this.room.match.is_player(client, 'player_1') ? 'player_1' : 'player_2';
        this.game_questions[this.current_question_index][player_how_answered] = answer_state;

        const p1_answer = this.current_question.player_1 !== null;
        const p2_answer = this.current_question.player_1 !== null;
        // Se ambos tiverem respondido
        if (p1_answer && p2_answer) {
            const cb = onBothAnswered ? onBothAnswered : () => {};
            cb({ player1_answer: p1_answer[0], player2_answer: p2_answer[0] });
        }
    }

    // Termina o jogo
    public endGame() : GameEndStatus {
        // Checa se o jogo está ocorrendo
        if (this.game_state !== GameStates.Playing)
            return;
        // Pega as respostas corretas e erradas de cada usuário
        const player1_right_questions = this.game_questions.filter(question => question.player_1 === 'right').length;
        const player2_right_questions = this.game_questions.filter(question => question.player_2 === 'right').length;
        // Termina o estado do jogo
        this.game_state = GameStates.Ended;
        // Retorna o vencedor
        const { match } = this.room;
        if (player1_right_questions !== player2_right_questions)
            return {
                draw: false,
                winner: player1_right_questions > player2_right_questions ? match.player_1 : match.player_2
            }
        // Retorna empate
        return { draw: true }
    }

    // Retorna a sala a qual esse jogo pertence
    get room() {
        return rooms_manager.get_room(this.room_key);
    }
    // Retorna a questão atual
    get current_question() {
        return this.game_questions[this.current_question_index];
    }
    // Retorna o jogo da sala passada como parâmetro
    public static get_game(room_id: string) {
        const room = rooms_manager.get_room(room_id);
        return room ? room.game : null;
    }
}



// Erro de jogo
// export class GameError {
//     public error_code: number;
//     public game_error: GameErrorModel; 
//     private error: Error;

//     constructor(error_code: number) {
//         // Tenta pegar os dados do erro
//         const game_error = Object.keys(GameErrors).map(
//             game_err_name => GameErrors[game_err_name]
//         ).filter(
//             game_err => game_err.code === error_code
//         )
//         // Caso não exista nenhum erro com esse código, para o código
//         if (!game_error.length)
//             throw new Error('Esse código de erro não existe');

//         this.game_error = game_error[0];
//         // Armazena o erro real do JS
//         const err = new Error();
//         err.name = this.game_error.name;
//         err.message = this.game_error.message;
//         this.error = err;   
//     }
//     // Envia o erro ao cliente
//     sendToClient(user: Client) {
//         user.emit('GAME_ERROR', this.game_error);
//     }
//     // Ativa o erro real
//     raiseError() {
//         throw this.error;
//     }
// } 





export async function getFullGameData(id: number) {
    const game = await getRepository(Games).findOne({
        where: { id },
        relations: [ 'quiz', 'match', 'match.player1', 'match.player2', 'match.answered_questions', 'match.currentQuestion' ]
    })
    return game;
}

export async function getFullQuizData(id: number) {
    const quiz = await getRepository(Quizzes).findOne({
        where: { id },
        relations: ['section', 'author', 'questions', 'questions.alternatives', 'questions.rightAlternative']
    });
    return quiz;
}