import { IPostsController, IPostsRepository, IPostsValidator } from "./postsTypes";
import { getCustomRepository } from "typeorm";
import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";
import { APIRoute } from "src/utils";

/**
 * Controlador de rotas relacionadas aos posts da aplicação.
 */
export class PostsController implements IPostsController {

    constructor(
        private repository: new () => IPostsRepository,
        private validator: IPostsValidator
    ) {  }

    /**
     * **web: /posts/ - GET**
     * 
     * Lista de postagens. Permite filtro por:
     * 
     * - nome do autor: string
     * - id do autor: number
     * - título: string
     */
    @APIRoute
    async list(request: APIRequest, response: Response, next: NextFunction) {
        const { query } = request;

        const posts = await this.repo.findPosts(query);

        return response.send(posts);
    }

    /**
     * **web: /posts/ - POST**
     * 
     * Cria um novo post
     */
    @APIRoute
    async create(request: APIRequest, response: Response, next: NextFunction) {
        return response.send('ok');
    }

    /**
     * **web: /posts/:id - GET**
     * 
     * Retorna um post especificado na URL
     */
    @APIRoute
    async read(request: APIRequest, response: Response, next: NextFunction) {
        return response.send('ok');
    }

    /**
     * **web: /posts/:id - PUT**
     * 
     * Atualiza o post
     */
    @APIRoute
    async update(request: APIRequest, response: Response, next: NextFunction) {
        return response.send('ok');
    }

    /**
     * **web: /posts/:id - PUT**
     * 
     * Permite deletar o quiz
     */
    @APIRoute
    async delete(request: APIRequest, response: Response, next: NextFunction) {
        return response.send('ok');
    }

    /**
     * **web: /posts/:id/like - POST**
     * 
     * Alterna o estado de like de um post
     */
    @APIRoute
    async like(request: APIRequest, response: Response, next: NextFunction) {
        return response.send('ok');
    }

    /**
     * **web: /posts/:id/comment - POST**
     * 
     * Permite comentar em um post
     */
    @APIRoute
    async comment(request: APIRequest, response: Response, next: NextFunction) {
        return response.send('ok');
    }
    

    get repo() {
        return getCustomRepository(this.repository);
    }
}