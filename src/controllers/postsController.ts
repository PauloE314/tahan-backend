import { Response, NextFunction, Request } from 'express';
import { Posts } from '@models/Posts';

import { APIRequest } from 'src/@types';
import { getRepository, Like } from 'typeorm';

/**
 * Controlador de rotas dos posts
 */
export default class PostController {
    // Lista os posts da existente
    // Pesquisar por: username do author e titulo
    async list (request: APIRequest, response: Response, next: NextFunction) {
        const query_params = request.query ? request.query : { title: null };
        const where = <any>{ topic: { id : request.topic.id } };

        if (query_params.title)
            where.title = Like(`%${query_params.title}%`);

        const posts = await getRepository(Posts)
            .find({
                relations: ["author", "topic"],
                where
            })

        return response.send(posts);
    }

    // Cria um post para o tópico
    async create (request: APIRequest, response: Response, next: NextFunction) {
        const new_post = new Posts();

        const { title, content } = request.body;
        new_post.title = title;
        new_post.content = content;
        new_post.topic = request.topic;
        new_post.author = request.user.info;

        const saved_post = await getRepository(Posts).save(new_post);
        
        return response.send(saved_post);
    }

    // Ver um post específico
    async read (request: APIRequest, response: Response, next: NextFunction) {
        const { post } = request;
    
        return response.send(post);
    }

    // Dá update no post (título e conteúdo)
    async update (request: APIRequest, response: Response, next: NextFunction) {
        const { post } = request;
        const { title, content } = request.body;

        if (title)
            post.title = title;

        if (content)
            post.content = content;

        try {
            const saved_post = await getRepository(Posts).save(post);

            return response.send(saved_post);
        }
        catch(err) {
            return response.send(err.message)
        }
    }

    // Deleta o post
    async delete (request: APIRequest, response: Response, next: NextFunction) {
        const { post } = request;

        await getRepository(Posts).remove(post);

        return response.send({ message: "Post deletado com sucesso" });
    }
}