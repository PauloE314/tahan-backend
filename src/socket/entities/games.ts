import { Room } from "./rooms";
import { SocketClient } from "./clients";
import { Server } from "socket.io";
import { Questions } from "@models/quiz/Questions";
import { randomizeArray, messagePrint } from "src/utils/index"
import { SocketEvents } from "@config/socket";
import { GameHistoric } from "@models/games/GameHistoric";
import { PlayerScore } from "@models/games/PlayerScore";
import { getRepository } from "typeorm";
import { Users } from "@models/User";

type TAnswers = 'right' | 'wrong' | null;
type TGameStates = 'onQuestion' | 'onInterval';

interface IQuestionState {
    question: Questions,
    playerAnswers: {
        [userId: number]: {
            answerId: number | null,
            state: TAnswers
        }
    }
}

interface IPlayerScore {
    [userId: number]: number
}

interface IEndGameData {
    winner?: Users,
    draw: boolean,
    scores: IPlayerScore
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

    // Estados
    public questionsStates: Array<IQuestionState> = [];
    public state: TGameStates;

    // Questão atual
    private currentQuestionIndex: number = 0;
    get currentQuestion() { return this.questionsStates[this.currentQuestionIndex] }

    // Contador
    public timer: GameTimer;
    


    constructor(room: Room) {
        this.roomId = room.id;
        const { clientList, quiz } = this.room;

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
            clientList.forEach(client => questionState.playerAnswers[client.user.id] = {
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
        // Mensagem
        messagePrint(`[JOGO APAGADO]: id: ${this.roomId}, total de jogos: ${Object.keys(Game.games).length}`);

        // Para o temporizador
        this.timer.stopTimer();

        Game.removeGame(this.roomId);
    }

    /**
     * Lida com o fim do jogo
     */
    async endGame(io: Server) {
        const questionsAmount = this.quiz.questions.length;

        // // Cria o score do jogador 1
        // const player1Score = new PlayerScore();
        // player1Score.player = player1.user;
        // player1Score.score = player1Points;
        

        // // Cria o score do jogador 2
        // const player2Score = new PlayerScore();
        // player2Score.player = player2.user;
        // player2Score.score = (player1Points / questionsAmount) * 10;

        // // Cria o histórico de partida
        // const gameHistoric = new GameHistoric();
        // gameHistoric.is_multiplayer = true;
        // gameHistoric.player_1_score = player1Score;
        // gameHistoric.player_2_score = player1Score;

        // // Salva o histórico de partida
        // await getRepository(GameHistoric).save(gameHistoric);

        // Calcula scores dos jogadores
        const playerScores: IPlayerScore = {};
        this.room.clientList.forEach(client => {
            // Calcula score do jogador
            const playerScore = (this.questionsStates.filter(state => (
                state.playerAnswers[client.user.id].state == 'right'
            )).length / questionsAmount) * 10;

            playerScores[client.user.id] = playerScore;
        })

        // Cria dados de fim de jogo
        const endGameData: IEndGameData = { draw: false, winner: null, scores: playerScores };

        // Ordena os scores dos jogadores
        const sortedScores = Object.entries(playerScores).sort((p1, p2) => {
            return p2[1] - p1[1];
        });

        // Dados dos usuários com maiores pontuações
        const firstPlaceId = Number(sortedScores[0][0]);
        const secondPlaceId = Number(sortedScores[1][0]);

        // Checa se deu empate
        if (playerScores[firstPlaceId] === playerScores[secondPlaceId])
            endGameData.draw = true;
            
        // Escolher vencedor
        else
            endGameData.winner = playerScores[firstPlaceId] > playerScores[secondPlaceId] ?
                this.room.clients[firstPlaceId].user:
                this.room.clients[secondPlaceId].user;
          
        // Avisa que o jogo acabou
        this.room.sendToAll(io, SocketEvents.EndGame, endGameData);

        // Apaga o jogo
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
    onTimeOver?: (game: Game) => any | Promise<any>
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