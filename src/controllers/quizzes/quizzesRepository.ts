import { BaseRepository } from "src/utils/bases";
import { Quizzes } from "@models/quiz/Quizzes";
import { EntityRepository } from "typeorm";

/**
 * Repositório dos quizzes da aplicação.
 */
@EntityRepository(Quizzes)
export class QuizzesRepository extends BaseRepository<Quizzes>  {

}