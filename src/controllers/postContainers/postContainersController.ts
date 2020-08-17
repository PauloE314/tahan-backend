import { getCustomRepository } from "typeorm";
import { APIRequest } from "src/@types";
import { Response } from "express";
import { APIRoute } from "src/utils";
import { PostContainersValidator } from "./postContainersValidator";
import { PostContainersRepository } from "./postContainersRepository";
import { IFilterAndPaginateInput } from "src/utils/bases";
import { codes } from "@config/server";

export class PostContainersController {

    validator = new PostContainersValidator();
    get repo() { return getCustomRepository(PostContainersRepository) }

    /**
     * **web: /post-containers/ - GET**
     * 
     * Lista os containers para posts. Permite filtro por:
     * 
     * - author_id: number,
     * - author: username
     * - name: string
     */
    @APIRoute
    async list(request: APIRequest, response: Response) {
        const { author, name, author_id, count, page } = request.query;

        // Configurações de filtro e paginação
        const listParams: IFilterAndPaginateInput = {
            count,
            page,
            filter: {
                name: { operator: 'like', data: name }
            }
        };
        // Lida com o id e username do autor
        if (author_id)
            listParams.filter['author.id'] = { operator: 'equal', data: author_id, getFromEntity: false };
        
        else if (author)
            listParams.filter['author.username'] = { operator: 'like', data: author, getFromEntity: false };

        // Aplica paginação e filtro
        const paginatedContainerList = await this.repo.listPostContainer({ params: listParams });

        return response.send(paginatedContainerList);
    }

    /**
     * **web: /post-containers/ - POST**
     * 
     * Permite criar um novo container para posts
     */
    @APIRoute
    async create(request: APIRequest, response: Response) {
        const user = request.user.info;
        const { name, posts } = request.body;

        const { posts: postList } = await this.validator.createValidation({ name, posts, user });

        const postContainer = await this.repo.createPostContainer({ name, posts: postList, user });

        return response.status(codes.CREATED).send(postContainer);
    }

    /**
     * **web: /post-containers/:id - GET**
     * 
     * Permite ler um container para posts
     */
    async read(request: APIRequest, response: Response) {
        const { container } = request;

        return response.send(container);
    }


    /**
     * **web: /post-containers/:id - PUT**
     * 
     * Permite atualizar um container para posts
     */
    @APIRoute
    async update(request: APIRequest, response: Response) {
        const { container } = request;
        const user = request.user.info;
        const { name, posts } = request.body;

        // Certifica que é o autor do container
        this.validator.isContainerAuthor({ user, container })

        const { posts: postList } = await this.validator.updateValidation({ name, posts, container, user });

        const updatedPost = await this.repo.updatePostContainer({ name, posts: postList, container });

        return response.send(updatedPost);
    }

    
    /**
     * **web: /post-containers/:id - DELETE**
     * 
     * Permite apagar um container para posts
     */
    @APIRoute
    async delete(request: APIRequest, response: Response) {
        const { container } = request;
        const user = request.user.info;

        // Certifica que o usuário é o autor do container
        this.validator.isContainerAuthor({ user, container });

        this.repo.remove(container);

        return response.send({ message: "Container apagado com sucesso" });
    }
}