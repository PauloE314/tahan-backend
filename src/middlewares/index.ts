import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";

import { getRepository } from "typeorm";
import { Topics } from "@models/Topics";
import { Posts } from "@models/Posts/Posts";
import { auth_user } from 'src/utils';
import { Quizzes } from "@models/quiz/Quizzes";

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
        relations: ["author"],
        where: { id: post_id }
    });

    if (!post)
        return response.send({ message: "Postagem não encontrada" });

    request.post = post;
    return next();
}

// Tenta encontrar o quiz
export async function getQuiz(request: APIRequest, response: Response, next: NextFunction) {
    const id = Number(request.params.id);

    if (!isNaN(id)) {
        const quiz = await getRepository(Quizzes).findOne({
            relations: ["questions", 'questions.alternatives', "questions.rightAnswer", "author"],
            where: { id }
        });

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
