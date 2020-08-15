import { getCustomRepository } from "typeorm";
import { QuizzesRepository } from "./quizzesRepository";
import QuizValidator from "@middlewares/validators/quizzesValidator";
import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";
import { APIRoute } from "src/utils";
import { IFilterAndPaginateInput } from "src/utils/bases";

/**
 * Controlador de rotas relacionadas aos quizzes da aplicação.
 */
export class QuizzesController {
    repository = QuizzesRepository
    validator = new QuizValidator()

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

        // Configurações de filtro e paginação
        const filterPaginateInput: IFilterAndPaginateInput = {
            count,
            page,
            filter: {
                name: { operator: 'like', data: name },
                topic: { operator: 'equal', data: topic },
            }
        };

        // Lida com o id e username do autor
        if (author_id)
            filterPaginateInput.filter['author.id'] = {
                operator: 'equal', data: author_id, getFromEntity: false
            };
        
        else if (author)
            filterPaginateInput.filter['author.username'] = {
                operator: 'like', data: author, getFromEntity: false
            };

        // Pega a lista e paginação
        const quizList = await this.repo.listQuizzes({ params: filterPaginateInput, queries: params });

        return response.send(quizList);
    }

    /**
     * **web: /quizzes/ - GET**
     * 
     * Lista os quizzes públicos existentes. Permite o filtro por:
     * 
     * - author_id: id do autor
     * - author: username do autor
     * - name: nome do quiz
     */
    

    get repo() {
        return getCustomRepository(this.repository);
    }
}