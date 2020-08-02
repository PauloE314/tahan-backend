import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";

import { getRepository } from "typeorm";
import { Topics } from "@models/Topics";
import { Posts } from "@models/Posts/Posts";
import { auth_user } from 'src/utils';
import { Quizzes } from "@models/quiz/Quizzes";
import { Containers } from "@models/Posts/Containers";

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
export async function getPost(request: APIRequest, response: Response, next: NextFunction) {
    const post_id = Number(request.params.id);

    const post = await getRepository(Posts).findOne({ 
        relations: ["author", "contents", "topic"],
        where: { id: post_id }
    });

    if (!post)
        return response.send({ message: "Postagem não encontrada" });

    request.post = post;
    return next();
}


/**
 * Pega o quiz usando a URL.
 */
export async function getQuiz(request: APIRequest, response: Response, next: NextFunction) {
    const id = Number(request.params.id);

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


/**
 * Pega uma amizade passada na URL e a salva na request
 */
export function getFriendship(id_name: string) {
    return async function (request: APIRequest, response: Response, next: NextFunction) {
        const id = Number(request.params[id_name]);

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
}