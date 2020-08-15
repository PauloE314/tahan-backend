import { BaseRepository, IFilterAndPaginateInput } from "src/utils/bases";
import { Quizzes } from "@models/quiz/Quizzes";
import { EntityRepository, getCustomRepository, getConnection } from "typeorm";
import { Alternatives } from "@models/quiz/Alternatives";
import { IRepoListQuizzes, IRepoCreateQuiz, IGetQuiz } from "./quizzesTypes";
import { Topics } from "@models/Topics";
import { Questions } from "@models/quiz/Questions";
import { Users } from "@models/User";
import { ValidationError } from "src/utils";
import bcrypt from 'bcrypt';
import config from 'src/config/server';



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
type ICreateQuestionInput = Array<{
    question: string,
    alternatives: Array<{
        text: string,
        right: boolean
    }>
}>


/**
 * Repositório dos quizzes da aplicação.
 */
@EntityRepository(Quizzes)
export class QuizzesRepository extends BaseRepository<Quizzes>  {

    /**
     * Listagem de quizzes da aplicação
     */
    async listQuizzes({ params, queries }: IListQuizzesInput): IRepoListQuizzes {
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
        const listQuizzes = await this.filterAndPaginate(quizListQueryBuilder, params);

        return listQuizzes;
    }

    /**
     * Criação de quizzes
     */
    async createQuiz({ mode, name, questions, topic, password, author }: ICreateQuizInput): IRepoCreateQuiz {
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

            const fullQuiz = await this.findOne({
                relations: ['questions', 'questions.alternatives', 'questions.rightAnswer'],
                where: {
                    id: saved.id
                }
            });

            // Roda as transactions;
            await queryRunner.commitTransaction();
            
            return fullQuiz;
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
    async getQuiz({ id }: { id: number }): IGetQuiz {
        const quiz = await this.findOne({
            relations: ['questions', 'questions.alternatives', 'questions.rightAnswer'],
            where: { id }
        });

        return quiz;
    }

    /**
     * Retorna dados sobre os likes de um quiz
     */
    async getQuizLikesData({ id, user }: { id: Number, user: Users } ) {
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
                count: quiz.likes,
                user_liked: userLiked ? true : false
            }
        }

        return {
            count: quiz.likes,
            user_liked: false
        };
    }

    /**
     * Atualização de quizzes
     */
    async updateQuiz(): Promise<any> {
        return {};
    }
    

    /**
     * Retorna as respostas dos quizzes
     */
    getQuizAnswers(quiz: Quizzes): any {
        return {};
    }

    get questionsRepo() {
        return getCustomRepository(QuestionsRepository);
    }
}

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
            await this.save(savedQuestion);

            response.push(savedQuestion);
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