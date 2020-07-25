import { Response, NextFunction, Request } from 'express';
import { Posts } from '@models/Posts/Posts';

import { APIRequest } from 'src/@types';
import { getRepository, Like } from 'typeorm';
import { Likes } from '@models/Posts/Likes';
import { Comments } from '@models/Posts/Comments';
import { Contents } from '@models/Posts/Contents';

/**
 * Controlador de rotas dos posts
 */
export default class PostController {
    // Lista os posts da existente
    // Pesquisar por: username do author e titulo
    async list (request: APIRequest, response: Response, next: NextFunction) {
        const query_params = request.query ? request.query : { title: null, author: null };

        // Pega os posts
        let posts = getRepository(Posts)
            .createQueryBuilder('post')
            .loadRelationCountAndMap('post.likes', 'post.likes')
            .leftJoin('post.topic', 'topic')
            .loadRelationIdAndMap('post.author', 'post.author')
            .where("topic.id = :topic_id", { topic_id: request.topic.id })
    
        // Filtra caso haja um título
        if (query_params.title) 
            posts = posts.where('post.title like :title', { title: `%${query_params.title}%` });

        // Filtra caso haja o autor
        if (query_params.author)
            posts = posts.where('post.author = :author_id', { author_id: query_params.author });
        
    
        return response.send(await posts.getMany());
    }

    // Cria um post para o tópico
    async create (request: APIRequest, response: Response, next: NextFunction) {
        const new_post = new Posts();
        const { title, contents, academic_level, description } = request.body;

        // Cria conteúdos
        const content_list = contents.map((content: { subtitle: string, text: string }) => {
            const new_content = new Contents();
            new_content.subtitle = content.subtitle;
            new_content.text = content.text;
            return new_content;
        }) 

        // Cria post
        new_post.title = title;
        new_post.description = description;
        new_post.contents = content_list;
        new_post.academic_level = academic_level;
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
        const comment = await getRepository(Comments)
            .createQueryBuilder('comments')
            .loadRelationIdAndMap('comments.author', 'comments.author')
            .loadRelationIdAndMap('comments.reference', 'comments.reference')
            .getMany()

        return response.send({ ...post, likes: count_likes, comments: { list: comment }})
    
    }

    // Dá update no post (título e conteúdo)
    async update (request: APIRequest, response: Response, next: NextFunction) {
        const { post } = request;
        const { title, contents, academic_level, description } = request.body;
        // Atualiza título
        if (title)
            post.title = title;
        // Atualiza conteúdos
        if (contents) {
            // Remove os conteúdos
            const remove_list = <Array<number>|undefined>contents.remove;
            if (remove_list) {
                post.contents = post.contents.filter(content => !remove_list.includes(content.id));
                await getRepository(Contents).delete(remove_list);
            }
            // Adiciona novos conteúdos
            const add_list = <Array<any>|undefined>contents.add;
            if (add_list) {
                const new_contents = add_list.map(content_data => {
                    const new_content = new Contents();
                    new_content.subtitle = content_data.subtitle;
                    new_content.text = content_data.text;
                    return new_content;
                });

                post.contents = [ ...post.contents, ...new_contents ];
            }
        }
        // Atualiza nível acadêmico
        if (academic_level)
            post.academic_level = academic_level;
        // Atualiza descrição
        if (description)
            post.description = description;

        const saved_post = await getRepository(Posts).save(post);

        return response.send(saved_post);
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
            await getRepository(Likes).save(like);
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
        const { text, reference } = request.body;
        const { user, post } = request;

        // Cria um comentário
        const comment = new Comments();
        comment.text = text;
        comment.author = user.info;
        comment.post = post;
        // Permite referênciar outro comentário
        if (reference)
            comment.reference = reference

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