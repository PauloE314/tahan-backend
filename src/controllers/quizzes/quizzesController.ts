import { getCustomRepository, getRepository } from "typeorm";
import { QuizzesRepository } from "./quizzesRepository";
import { QuizzesValidator } from "./quizzesValidator";
import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";
import { APIRoute } from "src/utils";
import { IFilterAndPaginateInput } from "src/utils/bases";
import { Quizzes } from "@models/quiz/Quizzes";

/**
 * Controlador de rotas relacionadas aos quizzes da aplicação.
 */
export class QuizzesController {
    repository = QuizzesRepository
    validator = new QuizzesValidator()

    /**
     * **web: /quizzes/ - GET**
     * 
     * Lista os quizzes públicos existentes. Permite o filtro por:
     * 
     * - author_id: id do autor
     * - author: username do autor
     * - name: nome do quiz
     */
    @APIRoute
    async list(request: APIRequest, response: Response, next: NextFunction) {
        const params = request.query;
        const  { count, page, author, author_id, name, topic } = params;


        const gambiarra = await getRepository(Quizzes).find({
            relations: ['questions', 'questions.alternatives']
        })
        return response.send(gambiarra);

        // Configurações de filtro e paginação
        const listParams: IFilterAndPaginateInput = {
            count,
            page,
            filter: {
                name: { operator: 'like', data: name },
                topic: { operator: 'equal', data: topic },
            }
        };
        // Lida com o id e username do autor
        if (author_id)
            listParams.filter['author.id'] = { operator: 'equal', data: author_id, getFromEntity: false };
        
        else if (author)
            listParams.filter['author.username'] = {operator: 'like', data: author, getFromEntity: false};

        // Pega a lista e paginação
        const quizList = await this.repo.listQuizzes({ params: listParams, queries: params });

        return response.send(quizList);
    }

    /**
     * **web: /quizzes/ - POST**
     * 
     * Cria um novo quiz.
     */
    @APIRoute
    async create(request: APIRequest, response: Response, next: NextFunction) {
        const author = request.user.info;
        const { body } = request;

        // Valida os campos
        const { mode, name, questions, topic, password } = await this.validator.createValidation(body);

        // Cria o quiz
        const quiz = await this.repo.createQuiz({ mode, name, questions, topic, password, author });

        // Retorna dados
        return response.send(quiz);
    }
    

    get repo() {
        return getCustomRepository(this.repository);
    }
}