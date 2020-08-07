import { Response, NextFunction, Request } from 'express';
import { Posts } from '@models/Posts/Posts';

import { APIRequest } from 'src/@types';
import { getRepository, Like } from 'typeorm';
import { Likes } from '@models/Posts/Likes';
import { Comments } from '@models/Posts/Comments';
import { Contents } from '@models/Posts/Contents';
import { Containers } from '@models/Posts/Containers';
import { APIRoute, paginate, filter } from 'src/utils';

/**
 * Controlador dos containers de posts
 */
export default class PostContainersController {
    /**
     * **web: /users/:id/posts - GET**
     * 
     * Lista containers de postagens feitos por um usuário. Permite filtro por:
     * 
     * - author: id
     * - name: string
     */
    @APIRoute
    async list(request: APIRequest, response: Response) {
        const { author, name } = request.query;

        // Listagem de containers
        const containers = getRepository(Containers)
        .createQueryBuilder('container')
        .leftJoin('container.posts', 'posts')
        .leftJoin('container.author', 'author')
        .select([
            'container',
            'author.id', 'author.username',
            'posts.id', 'posts.title', 'posts.academic_level'
        ])

        // Aplica filtros
        const filtered = filter(containers, {
            author: { equal: author },
            name: { like: name }
        })

        // Aplica paginação
        const containers_data = await paginate(filtered, request);

        // Resposta
        return response.send(containers_data);
    }

    /**
     * Cria um novo container para posts
     */
    @APIRoute
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
     * **Permite o usuário ler um container criado por um professor.**
     * 
     * /post-containers/:number/ - GET 
     */
    @APIRoute
    async read(request: APIRequest, response: Response) {
        const { container } = request;

        return response.send(container);
    }

    /**
     * Permite atualizar os containers
     */
    @APIRoute
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
    @APIRoute
    async delete(request: APIRequest, response: Response) {
        const { user, container } = request;
        await getRepository(Containers).remove(container);

        return response.send({ message: "Container deletado com sucesso" })
    }
}