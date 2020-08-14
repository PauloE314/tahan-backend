import { BaseRepository } from "src/utils/bases";
import { Quizzes } from "@models/quiz/Quizzes";
import { EntityRepository, getCustomRepository } from "typeorm";
import { Alternatives } from "@models/quiz/Alternatives";
import {
    IRepoListQuizzes,
    IRepoQuizAnswers,
    IRepoValidAlternative,
    IRepoValidQuiz
} from "./quizzesTypes";

/**
 * Repositório dos quizzes da aplicação.
 */
@EntityRepository(Quizzes)
export class QuizzesRepository extends BaseRepository<Quizzes>  {

    /**
     * Listagem de quizzes da aplicação
     */
    async listQuizzes(): IRepoListQuizzes {
        return {};
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