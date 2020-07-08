import { EntityRepository, Repository, getRepository } from "typeorm";
import { Games } from "@models/games/Games";
import { Quizzes } from "@models/quiz/Quizzes";
import { Questions } from "@models/quiz/Questions";
import { Users } from "@models/User";
import { GameAnswers } from "@models/games/GameAnswers";

interface NextQuestionData {
    question: Questions;
    serialized_question: any;
}


@EntityRepository(Games)
export default class GamesRepository extends Repository<Games> {


    // Pega os dados do quiz
    async getGameData(game: Games) : Promise<Games> {
        // Peha os dados do jogo 
        return (await this.findOne({
            relations: ['quiz', 'quiz.questions', 'quiz.questions.alternatives'],
            where: { id: game.id }
        }))
    }

    // Pega a próxima questão
    async getNextQuestion(game: Games): Promise<NextQuestionData | null> {
        const quiz = (await this.getGameData(game)).quiz;
        // Pega as respostas
        const answers = (await this.findOne({
            relations: ['answers'],
            where: { id: game.id }
        })).answers
        // Pega a lista dos ids das questões já respondidas
        const answered_questions = answers.map(answer => answer.question.id)
        // Pega a lista de questões não respondidas ainda
        const not_answered_questions = quiz.questions.filter(question => !answered_questions.includes(question.id));
        // Caso não haja mais questões, termina o jogo
        if (not_answered_questions.length === 0) {
            return this.endGame(game);
        }

        // Pega um elemento aleatório da lista de questões
        const question = not_answered_questions[Math.floor(Math.random() * not_answered_questions.length)];
        const serialized_question = Object.assign({}, question);
        delete serialized_question.rightAnswer;
        // Retorna os dados
        return { question, serialized_question }
    }

    // Responde a questão
    async answerQuestion(data: { game: Games, answer_id: number, question_id: number, user_id: number }): Promise<GameAnswers> {
        // Cria uma nova resposta
        const answer = new GameAnswers();
        // Pega os dados da questão
        const question = (await getRepository(Questions).findOne({
            relations: ['rightAnswer'],
            where: { id: data.question_id }
        }));
        // Pega o usuário que está respondendo
        const user = (await getRepository(Users).findOne({ id: data.user_id }));
        // Armazena os dados na resposta
        answer.game = data.game;
        answer.question = question;
        answer.user = user;
        // Seta se ela está correta ou não
        answer.isRight = data.answer_id === question.rightAnswer.id;
        // Salva a resposta
        const saved_answer = await getRepository(GameAnswers).save(answer);
        // Retorna os dados
        return saved_answer;
    }


    // Termina o jogo
    async endGame(game: Games) {
        const gameData = await this.getGameData(game);
        if (gameData) {
            // Pega a lista de respostas do jogo
            const game_answers = await getRepository(GameAnswers).find({
                relations: ['user'],
                where: { game: { id: gameData.id} }
            });
            // Quantidade de repostas corretas do jogador 1
            const player1_answers = game_answers.filter(game_answer => (
                game_answer.user.id == gameData.player1.id && game_answer.isRight
            )).length;
            // Quantidade de respostas corretas do jogador 2
            const player2_answers = game_answers.filter(game_answer => (
                game_answer.user.id == gameData.player2.id && game_answer.isRight
            )).length;
            
            // Armazena como correto o que tiver mais respostas corretas
            if (player1_answers !== player2_answers)
                gameData.winner = player1_answers > player2_answers ? gameData.player1 : gameData.player2;
            else
                gameData.draw = true;
        }
        // gameData.isGameEnd = true;
        await this.save(gameData);
        return null;
    }
}