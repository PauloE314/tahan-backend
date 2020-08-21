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
    get currentQuestion() { return this.questionsStates[this.currentQuestionIndex] }

    // Contador
    public timer: GameTimer;
    


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

        // Cria contador
        this.timer = new GameTimer(this);

        // Salva jogo
        Game.games[this.roomId] = this;
    }

    /**
     * Lida com a saída de um dos jogadores
     */
    async clientLeave(io: Server, player: SocketClient) {
        // Para o temporizador
        this.timer.stopTimer();

        Game.removeGame(this.roomId);
    }

    /**
     * Lida com a resposta do usuário
     */
    answerQuestion(player: SocketClient, answer: number) {
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

        return this.currentQuestion;
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
     * Pega dados seguros de uma questão
     */
    getSafeQuestionData(id?: number) {
        // Carrega o estado da questão
        const questionId = id !== undefined ? id: this.currentQuestionIndex;
        const questionState = this.questionsStates[questionId];

        // Certifica que ela existe
        if (questionState) {
            const { rightAnswer, quiz, ...safeData } = questionState.question;

            // Retorna dados seguros
            return safeData
        }
        else 
            return null;
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


interface ICountRunnerInput {
    times: number,
    execute?: (game: Game, counter: number, stopTimer: () => void) => any,
    onTimeOver?: (game: Game) => any
}
/**
 * Classe base para os temporizadores dos jogos. Esses temporizadores servem para auxiliar nas tarefas de rotina do jogo (como contagem de segundos, etc).
 */
class GameTimer {
    timer: NodeJS.Timer;
    count: number;
    game: Game;

    constructor(game: Game) {
        this.game = game;
    }
    
    /**
     * Para o contador e zera sua contagem
     */
    public stopTimer() {
        this.count = 0;
        clearInterval(this.timer);
    }

    /**
     * Inicia uma contagem e executa uma função a cada ciclo e ao fim da contagem como um todo.
     */
    public countRunner ({ times, execute, onTimeOver }: ICountRunnerInput) {
        this.count = times;
        
        // Cria o contador
        this.timer = setInterval(() => {
    
            // Para o contador e executa callback
            if (this.count == 0) {
                this.stopTimer();

                if (onTimeOver)
                    onTimeOver(this.game);
            }
    
            // Executa callback
            if (execute)
                execute(this.game, this.count, this.stopTimer);
    
            this.count--;
        }, 1000);
    }
}