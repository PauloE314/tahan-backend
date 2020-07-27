import { Response, NextFunction, Request } from 'express';
import { Posts } from '@models/Posts/Posts';

import { APIRequest } from 'src/@types';
import { getRepository, Like } from 'typeorm';
import { Likes } from '@models/Posts/Likes';
import { Comments } from '@models/Posts/Comments';
import { Contents } from '@models/Posts/Contents';
import { Containers } from '@models/Posts/Containers';

/**
 * Controlador dos containers de posts
 */
export default class PostContainersController {

    /**
     * Lista os containers 
     */
    async list(request: APIRequest, response: Response) {
        // Listagem de containers
        const containers = await getRepository(Containers)
        .createQueryBuilder('container')
        .leftJoinAndSelect('container.posts', 'posts')
        .loadRelationIdAndMap('container.author', 'container.author')
        .getMany();

        return response.send(containers);
    }

    /**
     * Cria um novo container para posts
     */
    async create(request: APIRequest, response: Response) {
        const { user, post_list } = request;
        const { name } = request.body;

        // Cria o container
        const container = new Containers();
        container.author = user.info;
        container.posts = post_list;
        container.name = name;
        const saved = await getRepository(Containers).save(container);

        return response.send(saved);
    }

    /**
     * Permite atualizar os containers
     */
    async update(request: APIRequest, response: Response) {
        const { user, container, post_list} = request;
        // return response.send('ok')

        const name: string = request.body.name;
        const add: Array<number> = request.body.add;
        const remove: Array<number>  = request.body.remove;

        // Atualiza o nome do container
        if (name)
            container.name = name;
        // Adiciona novos posts ao container
        if (add)
            container.posts = [...container.posts, ...post_list];
        // Remove posts do container
        if (remove)
            container.posts = container.posts.filter(post => !remove.includes(post.id));
            
        // Salva as alterações
        const saved = await getRepository(Containers).save(container);
        return response.send(saved);
    }

     /**
      * Apaga um container
      */
     async delete(request: APIRequest, response: Response) {
        const { user, container } = request;
        await getRepository(Containers).remove(container);

        return response.send({ message: "Container deletado com sucesso" })
    }
}