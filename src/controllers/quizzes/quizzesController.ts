import { IQuizzesController, IQuizzesRepository, IQuizzesValidator } from "./quizzesTypes";
import { getCustomRepository } from "typeorm";

/**
 * Controlador de rotas relacionadas aos quizzes da aplicação.
 */
export class QuizzesController implements IQuizzesController {

    constructor(
        private repository: new () => IQuizzesRepository,
        private validator: IQuizzesValidator
    ) {  }
    

    get repo() {
        return getCustomRepository(this.repository);
    }
}