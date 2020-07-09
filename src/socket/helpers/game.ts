import Client from "./client";
import { Quizzes } from "@models/quiz/Quizzes";
import { GameErrors, GameStates, SocketEvents, GameErrorModel } from "@config/socket";
import { Questions } from "@models/quiz/Questions";
import { Server } from "socket.io";
import { Games } from "@models/games/Games";
import { getRepository } from "typeorm";
import { Users } from "@models/User";


interface Player {
    client: Client,
    answers: Array<PlayerAnswer>
};

interface PlayerAnswer {
    question: Questions,
    isRight: Boolean
};

interface GameEndStatus {
    winner?: Player;
    draw: boolean;
}

// Modelo de jogo
export class GameQuiz {
    private io: Server;
    private player1: Player;
    private player2?: Player;
    private room_name: string;
    private answered_questions: Array<Questions>;
    public gameState: string;
    public quiz: Quizzes;
    public currentQuestion: Questions;
    public player1_ready: boolean;
    public player2_ready: boolean;


    constructor(io: Server, user: Client, quiz: Quizzes) {
        this.io = io;
        this.player1 = { client: user, answers: [] };
        this.quiz = quiz;
        this.gameState = GameStates.Begin;
        this.answered_questions = [];


        this.room_name  = 'game-' + quiz.id + '-' + user.socket.id;
        // Cria uma nova sala
        user.joinRoom(this.room_name);
    }


    // Adiciona um novo jogador
    public addPlayer(user: Client, options?: { emit: boolean }) {
        // Checa se o jogo ainda não começou
        this.assertGameState(GameStates.Begin, user);
        // Se já houver um segundo jogador, retorna um erro o jogador inicial
        if (this.player2) 
            this.generateError(GameErrors.RoomIsFull.code, { user, raise: true });

        const user_rooms = Object.keys(user.socket.rooms);
        // Checa que o usuário está em apenas uma sala
        if (user_rooms.length !== 1) 
            this.generateError(GameErrors.UserAlreadyInGame.code, { user, raise: true });

        const emit = options ? options.emit : true;

        this.player2 = { client: user, answers: [] };
        user.joinToExistentRoom(this.room_name);
        // Emite para todos da sala
        // if (emit)
            // user.emitRoom(SocketEvents.PlayerJoin);   
    }

    // Seta o usuário como pronto
    public setReady(user: Client, onAllReady: () => any) {
        // Certifica que o jogo ainda não começou
        this.assertGameState(GameStates.Begin, user);

        // Checa se o usuário é um jogador
        if(!this.isPlayer(user))
            this.generateError(GameErrors.UserNotInGame.code, { user, raise: true });

        // Seta o usuário 1 como pronto
        if(user == this.player1.client)
            this.player1_ready = true;
        // Seta o usuário 2 como pronto
        else if(user == this.player2.client)
            this.player2_ready = true;

        // Se todos estiverem prontos, executa a função
        if (this.allReady)
            onAllReady();
    }

    // Começa o jogo
    public startGame() {
        this.gameState = GameStates.Playing;
    }

    // Retorna uma nova questão
    public nextQuestion() {
        // Assegura que o jogo está acontecendo
        this.assertGameState(GameStates.Playing)

        const all_questions = this.quiz.questions;
        const no_answered_questions = all_questions.filter(question => this.answered_questions.includes(question));
        // Pega uma questão aleatória
        const random_question = no_answered_questions[Math.floor(Math.random() * no_answered_questions.length)];
        this.answered_questions.push(random_question);
        this.currentQuestion = random_question;
        // Retorna a qestão
        return random_question;
    }

    // Lida com a resposta
    public answerQuestion(user: Client, answer_id: number, onBothAnswered?: (data: { player1_answer: PlayerAnswer, player2_answer: PlayerAnswer }) => void) {
        // Checa se o jogador está no jogo
        if (!this.isPlayer(user))
            this.generateError(GameErrors.UserNotInGame.code, { user, raise: true });

        // Assegura que o jogo está ocorrendo
        this.assertGameState(GameStates.Begin, user);
        // Checa se ambos estão prontos
        if (!this.allReady)
            this.generateError(GameErrors.InvalidAction.code, { user, raise: true });

        this[user == this.player1.client ? 'player1' : 'player2'].answers.push(
            { question: this.currentQuestion, isRight: this.currentQuestion.rightAnswer.id === answer_id }
        );

        const p1_answer = this.player1.answers.filter(answer => answer.question === this.currentQuestion);
        const p2_answer = this.player2.answers.filter(answer => answer.question === this.currentQuestion);
        // Se ambos tiverem respondido
        if (p1_answer.length && p2_answer.length) {
            const cb = onBothAnswered ? onBothAnswered : () => {};
            cb({ player1_answer: p1_answer[0], player2_answer: p2_answer[0] });
        }
    }

    // Termina o jogo
    public endGame() : GameEndStatus {
        // Assegura que o jogo está acontecendo
        this.assertGameState(GameStates.Playing);
        // Pega as respostas corretas e erradas de cada usuário
        const player1_right_questions = this.player1.answers.filter(answer => answer.isRight).length;
        const player2_right_questions = this.player2.answers.filter(answer => answer.isRight).length;
        this.gameState = GameStates.Ended;
        // Retorna o vencedor
        if (player1_right_questions !== player2_right_questions)
            return { draw: false, winner: player1_right_questions > player2_right_questions ? this.player1 : this.player2 }
        // Retorna empate
        return { draw: true }
    }



    // Envia uma mensagem para ambos os usuários
    public sendToRoom(event_name: string, data?: any) {
        this.io.to(this.room_name).emit(event_name, data);
    }

    // Checa se usuário é um player
    public isPlayer(user: Client) {
        const is_player_1 = this.player1.client == user;
        const is_player_2 = this.player2 ? this.player2.client == user : false;
        return is_player_1 || is_player_2
    }

    // Assegura que o jogo tenha um estado específico
    private assertGameState(state: string, user?: Client) {
        if (this.gameState !== state) {
            if (user)
                this.generateError(GameErrors.InvalidAction.code, { user, raise: true });
            else
                this.generateError(GameErrors.InvalidAction.code, { raise: true });
        }
    }
    // Gera um erro de jogo
    private generateError(code: number, options: { user?: Client, raise: boolean} = { raise: true }) {
        // const gameError = new GameError(code);
        // if (options.user)
        //     gameError.sendToClient(options.user);
        // if (options.raise)
        //     gameError.raiseError();
    }

    // Checa se ambos estão prontos
    get allReady() {
        if (!this.player2)
            return false;

        return this.player1_ready && this.player2_ready && this.player2;
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




// Erro de jogo
export class GameError {
    public game_error: GameErrorModel; 
    private error: Error;

    constructor(game_error: GameErrorModel) {
        // Tenta pegar os dados do erro
        const error_exists = Object.keys(GameErrors).map(
            game_err_name => GameErrors[game_err_name]
        ).filter(
            game_err => game_err.code == game_error.code
        )
        // Caso não exista nenhum erro com esse código, para o código
        if (!(error_exists.length))
            throw new Error('Esse código de erro não existe');

        this.game_error = error_exists[0];
        console.log(this.game_error);
        // Armazena o erro real do JS
        const err = new Error();
        err.name = this.game_error.name;
        err.message = this.game_error.message;
        this.error = err;   
    }
    // Envia o erro ao cliente
    sendToClient(user: Client) {
        user.emit('GAME_ERROR', this.game_error);
    }
    // Ativa o erro real
    raiseError() {
        throw this.error;
    }
}

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