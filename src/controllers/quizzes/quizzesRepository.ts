import { IQuizzesRepository } from "./quizzesTypes";
import { BaseRepository } from "src/utils/bases";
import { Quizzes } from "@models/quiz/Quizzes";

/**
 * Repositório dos quizzes da aplicação.
 */
export class QuizzesRepository extends BaseRepository<Quizzes> implements IQuizzesRepository {

}