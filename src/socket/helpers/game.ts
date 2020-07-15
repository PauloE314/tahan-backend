import Client from "./client";
import { Quizzes } from "@models/quiz/Quizzes";
import { GameStates } from "@config/socket";
import { Questions } from "@models/quiz/Questions";
import Match from "./match";
import rooms_manager from './rooms';
import { random_array } from "src/utils";
import { Users } from "@models/User";

type PlayerAnswer =  'right' | 'wrong' | null;


interface GameQuestions {
    question: Questions,
    player_1: PlayerAnswer,
    player_2: PlayerAnswer
};

export interface GameEndStatus {
    winner?: Users;
    draw: boolean;
}

// Modelo de jogo
export default class GameQuiz {
    public room_key: string
    public game_state: string;
    public timmer: Counter;
    public quiz: Quizzes;
    public game_questions: Array<GameQuestions>;
    public current_question_index: number = 0;


    constructor(match: Match, quiz: Quizzes) {
        this.quiz = quiz;
        this.room_key = match.room_key;
        this.game_state = GameStates.Begin;
        this.timmer = new Counter();
        
        const { questions } = quiz;
        // Randomiza as questões do quiz
        const random_questions = random_array(questions);
        this.game_questions = random_questions.map(question => ({ question, player_1: null, player_2: null }));

        // Salva o game na sala
        rooms_manager.set_room(this.room_key, (room) => {
            return { match: room.match, game: this }
        })
    }

    // Começa o jogo
    public startGame() {
        this.game_state = GameStates.Playing;
    }

    // Retorna uma nova questão
    public nextQuestion(onEnd?: () => any): Questions | void {
        const cb = onEnd ? onEnd : () => {};
        
        // assegura que o jogo está ocorrendo
        if (this.game_state !== GameStates.Playing) 
            return;
        
        // Checa se ainda há questões para responder
        if (this.current_question_index + 1 === this.game_questions.length) {
            this.game_state = GameStates.BeforeEnd;
            return;
        }

        // Avança um índice
        this.current_question_index++;

        // Retorna a qestão
        const question = Object.assign({}, this.game_questions[this.current_question_index].question);
        delete question.rightAnswer;
        return question
    }

    // Lida com a resposta
    public answerQuestion(data : { client: Client, answer_id: number, on_answer: (player_answer: PlayerAnswer) => any,  on_both_answered?: (data: { player1_answer: PlayerAnswer, player2_answer: PlayerAnswer }) => void }) {
        // Checa se o jogo está ocorrendo
        if (this.game_state !== GameStates.Playing)
            return;

        const player_how_answered = this.room.match.is_player(data.client, 'player_1') ? 'player_1' : 'player_2';

        // checa se o usuário já respondeu
        if (this.current_question[player_how_answered] != null)
            return;
        
        // Checa se a resposta está correta
        const answer_state: PlayerAnswer = data.answer_id === this.current_question.question.rightAnswer.id ? 'right' : 'wrong';
        // Executa call back
        data.on_answer(answer_state);
        // Armazena a resposta
        
        this.game_questions[this.current_question_index][player_how_answered] = answer_state;

        const p1_answer = this.current_question.player_1 !== null;
        const p2_answer = this.current_question.player_2 !== null;
        // Se ambos tiverem respondido
        if (p1_answer && p2_answer) {
            const cb = data.on_both_answered ? data.on_both_answered : () => {};
            return cb({ player1_answer: this.current_question.player_1, player2_answer: this.current_question.player_2 });
        }
    }

    // Termina o jogo
    public endGame(data?: { forced_winner: Client }) : GameEndStatus {
        this.timmer.stop_timmer();
        // Checa se o jogo está para acabar ou está ocorrendo
        if (this.game_state !== GameStates.BeforeEnd && this.game_state !== GameStates.Playing) {
            return;
        }

        const { match } = this.room;
        // Se a vistória for forçada
        if (data) {
            const { forced_winner } = data;
            return { draw: false, winner: match[forced_winner.user.id === match.player_1.user.id ? 'player_1' : 'player_2'].user }
        }

        // Pega as respostas corretas e erradas de cada usuário
        const player1_right_questions = this.game_questions.filter(question => question.player_1 === 'right').length;
        const player2_right_questions = this.game_questions.filter(question => question.player_2 === 'right').length;
        // Termina o estado do jogo
        this.game_state = GameStates.Ended;

        
        // Retorna o vencedor
        if (player1_right_questions !== player2_right_questions)
            return {
                draw: false,
                winner: player1_right_questions > player2_right_questions ? match.player_1.user : match.player_2.user
            }
        // Retorna empate
        return { draw: true }
    }

    public delete_game() {
        rooms_manager.delete_game(this.room_key);
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
    public static get_game(room_id: string) : GameQuiz | null {
        const room = rooms_manager.get_room(room_id);
        return room ? room.game : null;
    }
}

class Counter {
    timmer: NodeJS.Timer;
    count: number;
    
    public stop_timmer() {
        this.count = 0;
        clearInterval(this.timmer);
    }

    public start_count_runner ( data: { times: number, execute?: (counter: number, stopTimmer: () => void) => any, on_time_over?: () => any }) {
        this.count = data.times;
        const execute = data.execute ? data.execute : () => {};
        const on_time_over = data.on_time_over ? data.on_time_over : () => {};
        
        // Cria o contador
        this.timmer = setInterval(() => {
    
            // Caso o contador acabe
            if (this.count == 0) {
                this.stop_timmer();
                on_time_over();
            }
    
            execute(this.count, this.stop_timmer);
    
            this.count--;
        }, 1000);
    }
}