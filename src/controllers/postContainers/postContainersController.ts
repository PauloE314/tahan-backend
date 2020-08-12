import { getCustomRepository } from "typeorm";
import PostContainersValidator from "@middlewares/validators/postContainersValidators";
import { APIRequest } from "src/@types";
import { NextFunction, Response } from "express";

export class PostContainersController {
    constructor (
        private repository: new () => PostContainersController,
        private validator: PostContainersValidator
    ) {  }
    
    /**
     * **web: /post-containers/ - GET**
     * 
     * Lista os containers para posts. Permite filtro por:
     * 
     * - author: number,
     * - name: string
     */
    async list(request: APIRequest, response: Response) {

    }

    /**
     * **web: /post-containers/ - POST**
     * 
     * Permite criar um novo container para posts
     */
    async create(request: APIRequest, response: Response) {
        
    }

    /**
     * **web: /post-containers/:id - GET**
     * 
     * Permite ler um container para posts
     */
    async read(request: APIRequest, response: Response) {
        
    }


    /**
     * **web: /post-containers/:id - PUT**
     * 
     * Permite atualizar um container para posts
     */
    async update(request: APIRequest, response: Response) {
        
    }

    
    /**
     * **web: /post-containers/:id - DELETE**
     * 
     * Permite apagar um container para posts
     */
    async delete(request: APIRequest, response: Response) {
        
    }

    get repo() {
        return getCustomRepository(this.repository);
    }
}