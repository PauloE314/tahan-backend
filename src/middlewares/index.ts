import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";

import { getRepository } from "typeorm";
import { Topics } from "@models/Topics";
import { Posts } from "@models/Posts/Posts";
import { auth_user } from 'src/utils';
import { Quizzes } from "@models/quiz/Quizzes";
import { Containers } from "@models/Posts/Containers";
import { Solicitations } from "@models/friends/Solicitations";
import { Friendships } from "@models/friends/Friendships";
import { codes } from "@config/index";


/**
 * Middleware que certifica que uma postagem existe. Permite diferentes obtenções de postagens através do "limit"
 */
export function getPost(limit: 'short' | 'medium' | 'long' = 'short') {
    return async function (request: APIRequest, response: Response, next: NextFunction) {
        const post_id = Number(request.params.postId);

        // Cria o queryBuilder
        const postQueryBuilder = getRepository(Posts)
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.author', 'author')
            .leftJoinAndSelect('post.topic', 'topic')
            .where('post.id = :post_id', { post_id })
            .select(['post', 'author', 'topic'])

        // Adiciona os conteúdos
        if (limit === 'medium' || limit === 'long') 
            postQueryBuilder
                .leftJoinAndSelect('post.contents', 'content')

        // Adiciona os likes
        if (limit === 'long')
            postQueryBuilder
                .leftJoin('post.likes', 'like')
                .select(['post', 'author', 'topic', 'like.id'])

        const post = await postQueryBuilder.getOne();

        // Certifica que a postagem existe
        if (!post)
            return response.status(codes.NOT_FOUND).send({ message: "Postagem não encontrada" });

        request.post = post;
        return next();
    }
}

/**
 * Middleware que certifica que uma solicitação de amizade existe.
 */
export function getSolicitation() {
    return async function (request: APIRequest, response: Response, next: NextFunction) {
        const id = Number(request.params.solicitationId)

        // Carrega a solicitação
        const solicitation = await getRepository(Solicitations).findOne({
            relations: ['sender', 'receiver'],
            where: { id }
        });

        // Certifica que ela existe
        if (!solicitation)
            return response.status(codes.NOT_FOUND).send({ message: "Solicitação não encontrada" });
        
        request.solicitation = solicitation;

        return next();
    }
}


/**
 * Middleware que certifica que a amizade existe.
 */
export function getFriendship() {
    return async function (request: APIRequest, response: Response, next: NextFunction) {
        const id = Number(request.params.friendshipId);

        // Carrega a amizade
        const friendship = await getRepository(Friendships).findOne({
            relations: ['user_1', 'user_2'],
            where: { id }
        });

        // Certifica que existe
        if (!friendship) 
            return response.status(codes.NOT_FOUND).send({ message: "Amizade não encontrada" });

        request.friendship = friendship;

        return next();
    }
}

/**
 * Middleware que certifica que um quiz existe.
 */
export function getQuiz(limit: 'full' | 'likes' = 'full') {
    return async function (request: APIRequest, response: Response, next: NextFunction) {
        const id = Number(request.params.quizId);

        if (!isNaN(id)) {
            // Cria o queryBuilder
            const quizQueryBuilder = getRepository(Quizzes)
                .createQueryBuilder('quiz')
                .where('quiz.id = :id', { id })
                .addSelect('quiz.mode')
                .addSelect('quiz.password')
                .leftJoinAndSelect('quiz.author', 'author')

            // Carrega as questões, alternativas, tópico e alternativa correta
            if (limit === 'full')
                quizQueryBuilder
                    .leftJoinAndSelect('quiz.questions', 'question')
                    .leftJoinAndSelect('question.alternatives', 'alternative')
                    .leftJoinAndSelect('question.rightAnswer', 'right_answer')
                    .leftJoinAndSelect('quiz.topic', 'topic')

            // Carrega os likes
            else if (limit === 'likes')
                quizQueryBuilder
                    .leftJoin('quiz.likes', 'like')
                    .addSelect(['like.id'])

            // Tenta encontrar um quiz
            const quiz = await quizQueryBuilder.getOne();

            // Certifica que ele existe
            if (!quiz)
                return response.status(codes.NOT_FOUND).send({ message: "Quiz não encontrado" });

            request.quiz = quiz;
        }

        return next();
    }
}

/**
 * Middleware que tenta carregar as informações do usuário logado caso esteja logado
 */
export function getUser() {
    return async function (request: APIRequest, response: Response, next: NextFunction) {
        const token = request.headers.authorization;
        try {
            // Autentica o usuário
            const user = await auth_user({ token, raiseError: false});

            // Caso ele esteja logado, salva seus dados
            if (user) 
                request.user = user;

            next();
        }
        catch(err) {
            return response.status(codes.NOT_FOUND).send({name: err.name, message: err.message})
        }
    }
}

// Tenta pegar o container
export function getContainer(limit: "likes" | "short" = 'short') {
    return async function (request: APIRequest, response: Response, next: NextFunction) {
        const id = Number(request.params.postContainerId);

        if (id) {
            // Cria um queryBuilder
            const containerQueryBuilder = getRepository(Containers)
                .createQueryBuilder('postContainer')
                .leftJoin('postContainer.author', 'author')
                .leftJoin('postContainer.posts', 'posts')
                .leftJoin('posts.likes', 'likes')
                .select([
                    'postContainer',
                    'author.id', 'author.username', 'author.email', 'author.image_url',
                    'posts.id', 'posts.title', 'posts.description', 'posts.academic_level'
                ])
                .where('postContainer.id = :id', { id })

            // Adiciona a contagem de likes
            if (limit === "likes")
                containerQueryBuilder
                    .loadRelationCountAndMap('posts.likes', 'postContainer.posts.likes');
            
            // Carrega container
            const container = await containerQueryBuilder.getOne();

            // Certifica que ele existe
            if (!container) 
                return response.status(codes.NOT_FOUND).send({ message: "Container não encontrado" })
            

            request.container = container;
            return next();
        }

        return next();
    }
}

