import { getCustomRepository } from "typeorm";
import { QuizzesRepository } from "./quizzesRepository";
import QuizValidator from "@middlewares/validators/quizzesValidator";

/**
 * Controlador de rotas relacionadas aos quizzes da aplicação.
 */
export class QuizzesController {

    constructor(
        private repository: new () => QuizzesRepository,
        private validator: QuizValidator
    ) {  }
    

    get repo() {
        return getCustomRepository(this.repository);
    }
}