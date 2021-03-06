import { EntityRepository, getCustomRepository, getConnection, getRepository } from "typeorm";

import { BaseRepository, IFilterAndPaginateInput } from "src/utils/baseRepository";
import { ValidationError } from "src/utils/baseValidator";

import { Quizzes } from "@models/quiz/Quizzes";
import { Alternatives } from "@models/quiz/Alternatives";
import { Topics } from "@models/Topics";
import { Questions } from "@models/quiz/Questions";
import { Users } from "@models/User";
import { PlayerScore } from "@models/games/PlayerScore";
import { GameHistoric } from "@models/games/GameHistoric";


import bcrypt from 'bcrypt';
import config from '@config/index';

/**
 * Interfaces do repositório
 */
interface IListQuizzesInput {
    params: IFilterAndPaginateInput,
    queries: any
}
interface ICreateQuizInput {
    name: string,
    mode: any,
    password?: string,
    topic: Topics,
    questions: ICreateQuestionInput,
    author: Users
}
interface IUpdateQuizInput {
    quiz: Quizzes
    name?: string,
    mode?: any,
    password?: string,
    topic?: Topics,
    add?: ICreateQuestionInput,
    remove: Array<number>
}
interface IQuizAnswerInput {
    quiz: Quizzes,
    user: Users,
    answers: Array<{
        question: number,
        answer: number
    }>
}



/**
 * Repositório dos quizzes da aplicação.
 */
@EntityRepository(Quizzes)
export class QuizzesRepository extends BaseRepository<Quizzes>  {

    /**
     * Listagem de quizzes da aplicação
     */
    async listQuizzes({ params, queries }: IListQuizzesInput) {
        const order = queries.order || null;
        
        // Cria o query builder
        const quizListQueryBuilder = this.createQueryBuilder('quiz')
            .leftJoin('quiz.topic', 'topic')
            .leftJoin('quiz.author', 'author')
            .leftJoin('quiz.likes', 'likes')
            .loadRelationCountAndMap('quiz.likes', 'quiz.likes')
            .select([
                'quiz',
                'topic',
                'author.id', 'author.username', 'author.image_url'
            ]);

        // Ordena a query pela quantidade de likes (many to many)
        if (order === 'relevance')
            quizListQueryBuilder
                .addSelect(`
                    CASE
                        WHEN quiz_likes.quizzesId IS NOT NULL THEN COUNT(quiz.id)
                        ELSE 0
                    END`,
                    'likes_count'
                )
                .groupBy('quiz.id')
                .orderBy('likes_count', 'DESC');

        // Pega a paginação e filtro
        return await this.filterAndPaginate(quizListQueryBuilder, params);
    }

    /**
     * Criação de quizzes
     */
    async createQuiz({ mode, name, questions, topic, password, author }: ICreateQuizInput) {
        // Inicia transaction
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const quiz = new Quizzes();
            quiz.name = name;
            quiz.mode = mode;
            quiz.topic = topic;
            quiz.author = author;
            quiz.password = password ? await bcrypt.hash(password, config.cryptTimes): undefined;

            // Salva o quiz
            const saved = await this.save(quiz);

            // Cria questões
            await this.questionsRepo.createQuestions(questions, saved);

            // Roda as transactions;
            await queryRunner.commitTransaction();
            
            return await this.getQuiz({ id: saved.id });
        }
        catch(err) {
            await queryRunner.rollbackTransaction();

            throw new ValidationError({ name: err.name, message: err.message }, 500)

        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Leitura de um quiz específico
     */
    async getQuiz({ id }: { id: number }) {
        const quiz = await this.findOne({
            relations: ['questions', 'questions.alternatives', 'questions.rightAnswer'],
            where: { id }
        });

        return quiz;
    }

    /**
     * Retorna dados sobre os likes de um quiz
     */
    async getQuizLikesData({ id, user }: { id: Number, user: Users }) {
        const userId = user ? user.id : null;
        
        const quiz = await this.createQueryBuilder('quiz')
            .where('quiz.id = :id', { id })
            .loadRelationCountAndMap('quiz.likes', 'quiz.likes')
            .getOne();
    
        // Checa se o usuário deu Like
        if (userId) {
            const userLiked = await this.createQueryBuilder('quiz')
                .leftJoin('quiz.likes', 'userLike')
                .where('quiz.id = :id', { id })
                .andWhere('userLike.id = :userId', { userId })
                .getOne();
            
            return {
                //@ts-ignore
                count: <number>quiz.likes,
                user_liked: userLiked ? true : false
            }
        }

        return {
            //@ts-ignore
            count: <number>quiz.likes,
            user_liked: false
        };
    }

    /**
     * Atualização de quizzes
     */
    async updateQuiz({ quiz, mode, name, password, add, remove, topic }: IUpdateQuizInput) {
        // Inicia transaction
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        try {
            // Atualiza informações brutas do quiz
            quiz.name = name || quiz.name;
            quiz.password = password || quiz.password;
            quiz.topic = topic || quiz.topic;
    
            // Mudar modo do quiz
            if (mode) {
                quiz.mode = mode;
                quiz.password = null;
            }

            // Remove questões
            if (remove) 
                for (const removeQuestId of remove) {
                    quiz.questions = quiz.questions.filter(quest => quest.id !== removeQuestId);
                    await this.questionsRepo.delete({ id: removeQuestId });
                }

            // Salva quiz
            const saved = await this.save(quiz);

            // Adiciona questões
            if (add) 
                await this.questionsRepo.createQuestions(add, saved);
            
            // Roda transactions
            await queryRunner.commitTransaction();

            // Pega os dados completos do quiz
            return await this.getQuiz({ id: saved.id });
        }
        catch(err) {
            // Desfaz alterações caso ocorra algum erro
            await queryRunner.rollbackTransaction();

            throw new ValidationError({ name: err.name, message: err.message }, 500);

        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Cria uma resposta para o usuários
     */
    async createQuizAnswer({ answers, user, quiz }: IQuizAnswerInput) {
        // Corrige as questões
        const serializedAnswers = answers.map(answer => {
            const question = quiz.questions.find(question => question.id === answer.question);
            return {
                question: question.id,
                answer: answer.answer,
                rightAnswer: question.rightAnswer.id,
                isRight: question.rightAnswer.id === answer.answer
            };
        });

        // Pega a lista de respostas corretas
        const correctAnswers = serializedAnswers.filter(answer => answer.isRight);

        // Score do usuário
        const score = (correctAnswers.length / quiz.questions.length) * 10;

        // Cria o score do player
        const playerScore = new PlayerScore();
        playerScore.player = user;
        playerScore.score = score;

        // Registra o jogo
        const game = new GameHistoric();
        game.is_multiplayer = false;
        game.player_1_score = playerScore;
        game.quiz = quiz;
        // Salva o jogo
        await getRepository(GameHistoric).save(game);
        
        // Retorna os dados
        return { answers: serializedAnswers, score };
    }

    /**
     * Retorna uma análise das estatísticas de um quiz
     */
    async getQuizStatistics({ quiz }: { quiz: Quizzes }) {
        const gameHistoric = await getRepository(GameHistoric)
        .createQueryBuilder('game')
        .leftJoinAndSelect('game.quiz', 'quiz')
        .leftJoinAndSelect('game.player_1_score', 'score_1')
        .leftJoinAndSelect('game.player_2_score', 'score_2')
        .loadRelationIdAndMap('score_1.player', 'score_1.player')
        .loadRelationIdAndMap('score_2.player', 'score_2.player')
        .where('game.quiz.id = :id', { id: quiz.id })
        .select(['game', 'score_1', 'score_2', 'quiz.id', 'quiz.created_at'])
        .getMany();

        return gameHistoric;
    }


    // Repositório de questões
    get questionsRepo() {
        return getCustomRepository(QuestionsRepository);
    }
}


type ICreateQuestionInput = Array<{
    question: string,
    alternatives: Array<{
        text: string,
        right: boolean
    }>
}>

/**
 * Repositório das alternativas da aplicação
 */
@EntityRepository(Questions)
export class QuestionsRepository extends BaseRepository<Questions> {
    /**
     * Cria questões
     */
    async createQuestions(input: ICreateQuestionInput, quiz: Quizzes): Promise<Array<Questions>> {
        const response = [];

        // Cria cada questão
        for (const data of input) {
            const newQuestion = new Questions();
            
            newQuestion.question = data.question;
            newQuestion.quiz = quiz;
            newQuestion.alternatives = [];
            const savedQuestion = await this.save(newQuestion);


            // Cria alternativas
            for (const altData of data.alternatives) {
                const newAlt = new Alternatives();
                newAlt.text = altData.text;
                newAlt.question = savedQuestion;

                savedQuestion.alternatives.push(newAlt);

                // Seta alternativa como certa ou não
                if (altData.right) 
                    savedQuestion.rightAnswer = newAlt;
                
            }
            const addedAltQuestion = await this.save(savedQuestion);

            response.push(addedAltQuestion);
        }
        return response;
    }

    get quizzesRepo() {
        return getCustomRepository(Quizzes);
    }
}

/**
 * Interfaces de entrada de dados
 */