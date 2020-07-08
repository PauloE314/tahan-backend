import Client from "./client";
import { Quizzes } from "@models/quiz/Quizzes";
import { GameErrors, GameStates, SocketEvents, GameErrorModel } from "@config/socket";
import { Questions } from "@models/quiz/Questions";
import { Server } from "socket.io";
import { Games } from "@models/games/Games";
import { Match } from "@models/games/Match";
import { getRepository } from "typeorm";
import { Users } from "@models/User";
import { GameAnswers } from "@models/games/GameAnswers";

const games: Array<any> = [];

export class Test {
    player1: string;
    player2: string;

    addPlayer1(name: string) {
        this.player1 = name;
    }
    addPlayer2(name: string) {
        this.player2 = name;
    }

    save() {
        games.push(this);
    }
    getAllGames() {
        console.log(games);
    }
}

interface PlayerAnswer {
    question: Questions,
    isRight: Boolean
};

interface GameEndStatus {
    winner?: Users;
    draw: boolean;
}

// Modelo de jogo
export class GameManager {
    private io: Server;
    private room_name: string;
    public game: Games;


    private constructor(io: Server, game: Games) {
        this.io = io;
        this.game = game;
        this.room_name = this.game.match.room_code;            
    }


    // Adiciona um novo jogador
    public addPlayey2(client: Client, options?: { emit: boolean }) {
        // Checa se o jogo ainda não começou
        this.assertGameState(GameStates.Begin, client);
        // Se já houver um segundo jogador, retorna um erro
        if (this.game.match.player2) 
            this.generateError(GameErrors.RoomIsFull.code, { client, raise: true });

        const user_rooms = Object.keys(client.socket.rooms);
        // Checa que o usuário está em apenas uma sala
        if (user_rooms.length !== 1) 
            this.generateError(GameErrors.UserAlreadyInGame.code, { client, raise: true });

        const emit = options ? options.emit : true;
        
        this.game.match.player2 = client.user;
        client.joinToExistentRoom(this.game.match.room_code);
        // salva os dados do jogador 2
        this.saveGame();
        // Emite para todos da sala
        if (emit)
            client.emitRoom(SocketEvents.PlayerJoin);   
    }


    // Seta o usuário como pronto
    public async setReady(client: Client, onAllReady: () => any) {
        // Certifica que o jogo ainda não começou
        this.assertGameState(GameStates.Begin, client);
        
        // Checa se o usuário é um jogador
        if(!this.isPlayer(client.user))
            this.generateError(GameErrors.UserNotInGame.code, { client, raise: true });

        // Seta o usuário 1 como pronto
        if(client.user == this.game.match.player1) 
           this.game.match.player1_ready = true
        
        // Seta o usuário 2 como pronto
        else if(client.user == this.game.match.player2) 
            this.game.match.player2_ready = true;

        await this.saveGame();
        

        // Se todos estiverem prontos, executa a função
        if (this.allReady)
            onAllReady();
    }

    // Começa o jogo
    public async startGame() {
        this.game.gameState = GameStates.Playing;
        this.game = await this.saveGame();
        return this.game;
    }

    // Retorna uma nova questão
    public async nextQuestion(onGameEnd?: () => any) {
        const gameEnd = onGameEnd ? onGameEnd : () => {};
        // Assegura que o jogo está acontecendo
        this.assertGameState(GameStates.Playing);

        const all_questions = this.game.quiz.questions;
        const no_answered_questions = await Promise.all(all_questions.filter(
            async question => this.game.match.answered_questions.includes(question)
        ));
        // Caso não haja mais questões para responder, termina o jogo
        if (no_answered_questions.length === 0) {
            gameEnd();
            return this.endGame();
        }

        // Pega uma questão aleatória
        const random_question = no_answered_questions[Math.floor(Math.random() * no_answered_questions.length)];
        // Atualiza a lista de questões respondidas e a questão atual
        this.game.match.answered_questions.push(random_question);
        this.game.match.currentQuestion = random_question;
        // Salva o game
        await this.saveGame();
        // Retorna a questão
        return random_question;
    }

    // Lida com a resposta
    public async answerQuestion(client: Client, answer_id: number, onBothAnswered?: (data: { player1_answer: PlayerAnswer, player2_answer: PlayerAnswer }) => void) {
        // Checa se o jogador está no jogo
        if (!this.isPlayer(client.user))
            this.generateError(GameErrors.UserNotInGame.code, { client, raise: true });

        // Assegura que o jogo está ocorrendo
        this.assertGameState(GameStates.Begin, client);
        // Checa se ambos estão prontos
        if (!this.allReady)
            this.generateError(GameErrors.InvalidAction.code, { client, raise: true });

        const answer = new GameAnswers();
        answer.question = this.game.match.currentQuestion;
        answer.isRight = this.game.match.currentQuestion.rightAnswer.id === answer_id;
        answer.match = this.game.match;
        answer.user = client.user;
        // Salva a resposta
        this.game.match.answers.push(answer);
        const game = await this.saveGame();

        // Checa as respostas dos usuários
        const p1_answer = game.match.answers.filter(answer => (
            answer.question == game.match.currentQuestion && answer.user == game.match.player1
        ));
        const p2_answer = game.match.answers.filter(answer => (
            answer.question == game.match.currentQuestion && answer.user == game.match.player2
        ));
        // Se ambos tiverem respondido
        if (p1_answer.length && p2_answer.length) {
            const cb = onBothAnswered ? onBothAnswered : () => {};
            cb({ player1_answer: p1_answer[0], player2_answer: p2_answer[0] });
        }
    }

    // Termina o jogo
    public async endGame() : Promise<GameEndStatus> {
        // Assegura que o jogo está acontecendo
        this.assertGameState(GameStates.Playing);
        // Pega as respostas corretas e erradas de cada usuário
        const player1_right_questions = this.game.match.answers.filter(
            answer => answer.isRight && answer.user == this.game.match.player1
        ).length;
        const player2_right_questions = this.game.match.answers.filter(
            answer => answer.isRight && answer.user == this.game.match.player2
        ).length;
        // Termina o jogo
        this.game.gameState = GameStates.Ended;
        const game = await this.saveGame();
        
        // Retorna o vencedor
        if (player1_right_questions !== player2_right_questions)
            return {
                draw: false,
                winner: player1_right_questions > player2_right_questions ? game.match.player1 : game.match.player2
            }
        // Retorna empate
        return { draw: true }
    }



    // Envia uma mensagem para ambos os usuários
    public sendToRoom(event_name: string, data?: any) {
        this.io.to(this.room_name).emit(event_name, data);
    }

    // Checa se usuário é um player
    public isPlayer(user: Users) {
        const is_player_1 = this.game.match.player1 == user;
        const is_player_2 = this.game.match.player2 ? this.game.match.player2 == user : false;
        return is_player_1 || is_player_2
    }

    // Assegura que o jogo tenha um estado específico
    private assertGameState(state: string, client?: Client) {
        if (this.game.gameState !== state) {
            if (client)
                this.generateError(GameErrors.InvalidAction.code, { client, raise: true });
            else
                this.generateError(GameErrors.InvalidAction.code, { raise: true });
        }
    }
    // Gera um erro de jogo
    private generateError(code: number, options: { client?: Client, raise: boolean} = { raise: true }) {
        const gameError = new GameError(code);
        if (options.client)
            gameError.sendToClient(options.client);
        if (options.raise)
            gameError.raiseError();
    }

    // Checa se ambos estão prontos
    get allReady() {
        if (!this.game.match.player2)
            return false;

        return this.game.match.player1_ready && this.game.match.player2_ready && this.game.match.player2;
    }

    // Retorna as informações do jogo
    private async getGame() {
        return await getRepository(Games).findOne({
            where: { id: this.game.id },
            relations: ['']
        })
    }

    private async saveGame() {
        return await getRepository(Games).save(this.game);
    }
}



// Erro de jogo
export class GameError {
    public error_code: number;
    public game_error: GameErrorModel; 
    private error: Error;

    constructor(error_code: number) {
        // Tenta pegar os dados do erro
        const game_error = Object.keys(GameErrors).map(
            game_err_name => GameErrors[game_err_name]
        ).filter(
            game_err => game_err.code === error_code
        )
        // Caso não exista nenhum erro com esse código, para o código
        if (!game_error.length)
            throw new Error('Esse código de erro não existe');

        this.game_error = game_error[0];
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