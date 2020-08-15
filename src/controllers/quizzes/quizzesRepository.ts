import { BaseRepository, IFilterAndPaginateInput } from "src/utils/bases";
import { Quizzes } from "@models/quiz/Quizzes";
import { EntityRepository, getCustomRepository } from "typeorm";
import { Alternatives } from "@models/quiz/Alternatives";
import {
    IRepoListQuizzes,
    IRepoQuizAnswers,
    IRepoValidAlternative,
    IRepoValidQuiz
} from "./quizzesTypes";

interface IListQuizzesInput {
    params: IFilterAndPaginateInput,
    queries: any
}
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
    async createQuiz(): IRepoValidQuiz {
        return {};
    }

    /**
     * Atualização de quizzes
     */
    async updateQuiz(): IRepoValidQuiz {
        return {};
    }

    /**
     * Retorna as respostas dos quizzes
     */
    getQuizAnswers(quiz: Quizzes): IRepoQuizAnswers {
        return {};
    }

    get alternativeRepo() {
        return getCustomRepository(AlternativeRepository);
    }
}

/**
 * Repositório das alternativas da aplicação
 */
@EntityRepository(Alternatives)
export class AlternativeRepository extends BaseRepository<Alternatives> {
    /**
     * Cria alternativa
     */
    async createAlternative(): IRepoValidAlternative {
        return {};
    }

    get quizzesRepo() {
        return getCustomRepository(Quizzes);
    }
}


/**
 * Interfaces de entrada de dados
 */