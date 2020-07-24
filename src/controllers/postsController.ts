import { Response, NextFunction, Request } from 'express';
import { Posts } from '@models/Posts/Posts';

import { APIRequest } from 'src/@types';
import { getRepository, Like } from 'typeorm';
import { Likes } from '@models/Posts/Likes';
import { Comments } from '@models/Posts/Comments';

/**
 * Controlador de rotas dos posts
 */
export default class PostController {
    // Lista os posts da existente
    // Pesquisar por: username do author e titulo
    async list (request: APIRequest, response: Response, next: NextFunction) {
        const query_params = request.query ? request.query : { title: null };

        // Pega os posts
        const all_posts = getRepository(Posts)
            .createQueryBuilder('post')
            .loadRelationCountAndMap('post.likes', 'post.likes')
            .leftJoinAndSelect('post.topic', 'topic')
            .where("topic.id = :topic_id", { topic_id: request.topic.id })
    
        // Filtra caso haja um título
        if (query_params.title) {
            const filtered_posts = await all_posts
                .where('post.title like :title', { title: `%${query_params.title}%` })
                .getMany()
        
            return response.send(filtered_posts);
        }
        
        return response.send(await all_posts.getMany());
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
        // Pega a quantidade de likes
        const [likes, count_likes] = await getRepository(Likes).findAndCount({
            relations: ['post'],
            where: { post: { id: post.id } }
        })
        // Pega comentários
        const [comments, count_comments] = await getRepository(Comments).findAndCount({
            // relations: ['post'],
            where: { post: { id: post.id } }
        })
    
        return response.send({ ...post, likes: count_likes, comments: { list: comments, count_comments } });
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

    /**
     * Permite dar like em post
     */
    async like(request: APIRequest, response: Response) {
        const { post, user } = request;
        // Tenta pegar o like anterior
        const original_like = await getRepository(Likes).findOne({
            where: { user: { id: user.info.id }}
        })
        // Caso ele não existe, cria um novo
        if (!original_like) {
            const like = new Likes();
            like.post = post;
            like.user = user.info;
            // Salva o like
            const saved_like = await getRepository(Likes).save(like);
            return response.send({ message: 'Like' });
        }
        // Caso exista, apaga o like
        else {
            await getRepository(Likes).remove(original_like);
            return response.send({ message: 'Like retirado' })
        }
    }

    /**
     * Permite o usuário comentar no post
     */
    async comment (request: APIRequest, response: Response) {
        const { text } = request.body;
        const { user, post } = request;

        // Cria um comentário
        const comment = new Comments();
        comment.text = text;
        comment.author = user.info;
        comment.post = post;
        const saved_comment = await getRepository(Comments).save(comment);

        delete saved_comment.post;
        // Retorna os dados do comentário
        return response.send(saved_comment);
    }

    // Deleta o post
    async delete (request: APIRequest, response: Response, next: NextFunction) {
        const { post } = request;

        await getRepository(Posts).remove(post);

        return response.send({ message: "Post deletado com sucesso" });
    }
}