import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";

import { getRepository, getCustomRepository } from "typeorm";
import { Topics } from "@models/Topics";
import { Posts } from "@models/Posts/Posts";
import { auth_user } from 'src/utils';
import { Quizzes } from "@models/quiz/Quizzes";
import { Containers } from "@models/Posts/Containers";
import { Solicitations } from "@models/friends/Solicitations";
import { Friendships } from "@models/friends/Friendships";
import { PostCommentRepository } from "@controllers/posts/postsRepository";


// Tenta encontrar um tópico pelo id
export async function getTopic(request: APIRequest, response: Response, next: NextFunction) {
    const topic_id = Number(request.params.topic_id)

    const topic = await getRepository(Topics).findOne({ id: topic_id });

    if (!topic) {
        return response.status(401).send({ message: "Seção não encontrada" });
    }

    request.topic = topic;
    return next();
}

// Tenta encontrar uma postagem pelo id
export function getPost(limit: 'short' | 'medium' | 'long' = 'short') {
    return async function (request: APIRequest, response: Response, next: NextFunction) {
        const post_id = Number(request.params.id);

        const postQueryBuilder = getRepository(Posts)
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.author', 'author')
            .leftJoinAndSelect('post.topic', 'topic')
            .where('post.id = :post_id', { post_id })
            .select(['post', 'author', 'topic'])

        if (limit === 'medium' || limit === 'long') 
            postQueryBuilder
                .leftJoinAndSelect('post.contents', 'content')

        if (limit === 'long')
            postQueryBuilder
                .leftJoin('post.likes', 'like')
                .select(['post', 'author', 'topic', 'like.id'])

        const post = await postQueryBuilder.getOne();

        if (!post)
            return response.send({ message: "Postagem não encontrada" });

        request.post = post;
        return next();
    }
}

/**
 * Tenta pegar o comentário de uma postagem
 */
export function getPostComment() {
    return async function(request: APIRequest, response: Response, next: NextFunction) {
        const id = Number(request.params.postCommentId);

        const postCommentQueryBuilder = getCustomRepository(PostCommentRepository)
            .createQueryBuilder('comment')
            .leftJoinAndSelect('comment.author', 'user')
            .where('comment.id = :id', { id })
            
        const comment = await postCommentQueryBuilder.getOne();

        if (!comment)
            return response.status(404).send({ message: "Comentário não encontrado" });

        request.postComment = comment;

        return next();
    }
}

/**
 * Pega os dados de uma solicitação de amizade pela URL
 */
export async function getSolicitation(request: APIRequest, response: Response, next: NextFunction) {
    const id = Number(request.params.solicitationId)

    const solicitation = await getRepository(Solicitations).findOne({
        relations: ['sender', 'receiver'],
        where: { id }
    });

    if (!solicitation)
        return response.status(404).send({ message: "Solicitação não encontrada" });
    
    request.solicitation = solicitation;

    return next();
}



/**
 * Pega uma amizade passada na URL e a salva na request
 */
export async function getFriendship(request: APIRequest, response: Response, next: NextFunction) {
    const id = Number(request.params.friendshipId);

    const friendship = await getRepository(Friendships).findOne({
        relations: ['user_1', 'user_2'],
        where: { id }
    });

    if (!friendship) 
        return response.status(404).send({ message: "Amizade não encontrada" });

    request.friendship = friendship;

    return next();
}

/**
 * Pega o quiz usando a URL.
 */
export async function getQuiz(request: APIRequest, response: Response, next: NextFunction) {
    const id = Number(request.params.quizId);

    if (!isNaN(id)) {
        const quiz = await getRepository(Quizzes)
            .createQueryBuilder('quiz')
            .leftJoinAndSelect('quiz.questions', 'question')
            .leftJoinAndSelect('question.alternatives', 'alternative')
            .leftJoinAndSelect('question.rightAnswer', 'right_answer')
            .leftJoinAndSelect('quiz.author', 'author')
            .leftJoinAndSelect('quiz.topic', 'topic')
            .where('quiz.id = :id', { id })
            .addSelect('quiz.mode')
            .addSelect('quiz.password')
            .getOne();


        if (!quiz)
            return response.send({ message: "Quiz não encontrado" });

        request.quiz = quiz;
    }

    return next();
}

// Tenta encontrar o usuário
export async function getUser(request: APIRequest, response: Response, next: NextFunction) {
    const token = request.headers.authorization;
    try {
        const user = await auth_user({ token, raiseError: false});
        if (user) 
            request.user = user;

        next();
    }
    catch(err) {
        return response.send({name: err.name, message: err.message})
    }
}


// Tenta pegar o container
export async function getContainer(request: APIRequest, response: Response, next: NextFunction) {
    const id = Number(request.params.id);

    if (id) {
        const container = await getRepository(Containers).findOne({
            relations: ['author', 'posts'],
            where: { id }
        });
        if (container) {
            request.container = container;
            return next();
        }
        return response.status(400).send({ message: "Container de posts não encontrado" })
    }
    return next();
}

