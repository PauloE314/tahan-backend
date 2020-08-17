import { getCustomRepository, getRepository } from "typeorm";
import { QuizzesRepository } from "./quizzesRepository";
import { QuizzesValidator } from "./quizzesValidator";
import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";
import { APIRoute } from "src/utils";
import { IFilterAndPaginateInput } from "src/utils/bases";
import { Quizzes } from "@models/quiz/Quizzes";
import bcrypt from 'bcrypt';
import { codes } from "@config/server";
import { GameHistoric } from "@models/games/GameHistoric";

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

        // Configurações de filtro e paginação
        const listParams: IFilterAndPaginateInput = {
            count,
            page,
            filter: {
                name: { operator: 'like', data: name },
                topic: { operator: 'equal', data: topic },
                mode: { operator: 'equal', data: 'public' }
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

    /**
     * **web: /quizzes/public/:id - GET**
     * 
     * Retorna os dados completos de um quiz público.
     */
    @APIRoute
    async readPublic(request: APIRequest, response: Response, next: NextFunction) {
        const { quiz } = request;
        const user = request.user.info;

        // Certifica que o quiz é público
        if (quiz.mode !== 'public')
            return response.status(401).send({
                message: 'Permissão negada: ação inválida para quiz privado'
            });

        // Dados de like
        const likeData = await this.repo.getQuizLikesData({ id: quiz.id, user });

        delete quiz.password;

        return response.send({ ...quiz, likes: likeData });
    }

    /**
     * **web: /quizzes/private/:id - POST**
     * 
     * Retorna os dados completos de um quiz público.
     */
    @APIRoute
    async readPrivate(request: APIRequest, response: Response, next: NextFunction) {
        const { quiz } = request;
        const user = request.user.info;
        const { password } = request.body;

        // Certifica que o quiz é privado
        if (quiz.mode !== 'private')
            return response.status(401).send({
                message: 'Permissão negada: ação inválida para quiz público'
            });

        // Checa se é o autor do quiz
        if (quiz.author.id !== user.id)
            // Compara senha
            if(!(await bcrypt.compare(password || '-1', quiz.password))) 
                return response.status(401).send({ message: 'Senha inválida' });

        // Pega os dados de um quiz
        const likeData = await this.repo.getQuizLikesData({ id: quiz.id, user });

        delete quiz.password;

        return response.send({ ...quiz, likes: likeData });
    }

    /**
     * **web: /quizzes/:id - PUT**
     * 
     * Permite o autor atualizar seu quiz
     */
    @APIRoute
    async update(request: APIRequest, response: Response, next: NextFunction) {
        // throw new Error('test')
        const user = request.user.info;
        const { quiz, body } = request;

        // Certifica que o usuário é o autor do quiz
        this.validator.isQuizAuthor({ quiz, user });

        // Valida a atualização do quiz
        const validData = await this.validator.updateValidation({ ...body, quiz });

        // Atualiza quiz
        const updatedQuiz = await this.repo.updateQuiz({ ...validData, quiz });

        return response.send(updatedQuiz);
    }

    /**
     * **web: /quizzes/:id - DELETE**
     * 
     * Permite o autor apagar seu quiz
     */
    @APIRoute
    async delete(request: APIRequest, response: Response, next: NextFunction) {
        const user = request.user.info;
        const { quiz } = request;

        // Certifica que o usuário é o autor do quiz
        this.validator.isQuizAuthor({ quiz, user });

        // Apaga o quiz
        this.repo.remove(quiz);

        return response.send({ message: 'Quiz apagado com sucesso' });
    }

    /**
     * **web: /quizzes/:id/answer - POST**
     * 
     * Permite um aluno responder um quiz
     */
    @APIRoute
    async answer(request: APIRequest, response: Response, next: NextFunction) {
        const user = request.user.info; 
        const { quiz } = request;
        const { answers, password } = request.body;

        // Valida a senha
        if (quiz.mode === 'private') {
            // Compara a senha
            const passwordMatches = await bcrypt.compare(password || '-1', quiz.password)
            if(!passwordMatches) 
                return response.status(codes.PERMISSION_DENIED).send({ message: 'Senha inválida' });
        }

        // Valida respostas do quiz
        this.validator.validateQuizAnswer({ answers, quiz });

        // Cria resposta
        const report = await this.repo.createQuizAnswer({ answers, user, quiz });

        return response.send(report);
    }

    /**
     * **web: /quizzes/:id/games - POST**
     * 
     * Permite o professor ver dados dos jogos de um quiz.
     */
    @APIRoute
    async games(request: APIRequest, response: Response, next: NextFunction) {
        const { quiz } = request;
        const user = request.user.info;

        // Certifica que é o autor do quiz
        this.validator.isQuizAuthor({ quiz, user });

        const statistics = await this.repo.getQuizStatistics({ quiz });

        return response.send(statistics);
    }
    

    get repo() {
        return getCustomRepository(this.repository);
    }
}