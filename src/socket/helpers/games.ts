import { Room } from "./rooms";
import { SocketClient } from "./clients";
import { Quizzes } from "@models/quiz/Quizzes";
import { Server } from "socket.io";
import { Questions } from "@models/quiz/Questions";
import { randomizeArray } from "src/utils/index"

type TAnswers = 'right' | 'wrong' | null;

interface IQuestionState {
    question: Questions,
    playerAnswers: {
        [userId: number]: {
            answerId: number | null,
            state: TAnswers
        }
    }
}

/**
 * Classe base para os jogos da aplicação. Os jogos são quizzes pensados para o multiplayer e tempo real.
 */
export class Game {
    // Listagem de jogos
    static games: { [gameId: string]: Game } = {};

    // Sala
    public roomId: string;
    get room() { return Room.getRoom(this.roomId) };
    
    // Quiz
    get quiz() { return this.room.quiz }

    // Estados das questões
    public questionsStates: Array<IQuestionState> = [];

    // Questão atual
    private currentQuestionIndex: number = 0;
    get currentQuestion() {
        try { return this.questionsStates[this.currentQuestionIndex]; } catch { return null }
    }
    

    constructor(room: Room) {
        this.roomId = room.id;
        const { clients, quiz } = this.room;

        // Randomiza as questões
        const randomQuestions = randomizeArray(quiz.questions);

        // Cria estrutura de dados para comportar os jogadores
        this.questionsStates = randomQuestions.map(question => {

            // Registra a resposta correta
            const questionState: IQuestionState = {
                question,
                playerAnswers: {}
            };

            // Registra todos os clientes em cada questão
            clients.forEach(client => questionState.playerAnswers[client.user.id] = {
                answerId: null,
                state: null
            });

            return questionState;
        });

        // Salva jogo
        Game.games[this.roomId] = this;
    }

    /**
     * Lista com a saída de um dos jogadores
     */
    async clientLeave(io: Server, player: SocketClient) {

    }

    /**
     * Lida com a resposta do usuário
     */
    answerQuestion(io: Server, player: SocketClient, answer: number) {
        // Checa se o usuário respondeu corretamente
        const answerIsRight = this.currentQuestion.question.rightAnswer.id === answer;

        // Resposta do usuário
        const playerAnswer = answerIsRight ? 'right': 'wrong';

        // Armazena resposta do usuário
        this.currentQuestion.playerAnswers[player.user.id].answerId = answer;

        // Armazena se o usuário respondeu corretamente
        this.currentQuestion.playerAnswers[player.user.id].state = playerAnswer;

        return playerAnswer;
    }

    /**
     * Avança para a próxima questão
     */
    nextQuestion() {
        this.currentQuestionIndex++;
    }

    /**
     * Checa se todos os usuários responderam a questão
     */
    allAnswered() {
        const { currentQuestion } = this;

        // Pega a lista de clientes que ainda não responderam
        const notAnsweredClients = Object.keys(currentQuestion.playerAnswers).filter(playerAnswerKey => {
            const playerAnswer = currentQuestion.playerAnswers[Number(playerAnswerKey)];

            return playerAnswer.state === null;
        });

        // Checa se existe algum cliente que ainda não respondeu
        return notAnsweredClients.length === 0;
    }

    /**
     * Retorna um jogo
     */
    static getGame(gameId: string) {
        return Game.games[gameId];
    }
    /**
     * Apaga jogo
     */
    static removeGame(gameId: string) {
        delete Game.games[gameId];
    }
}