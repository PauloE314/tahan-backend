import { APIRequest } from "src/@types/global";
import { Response, NextFunction } from "express";

import { getRepository } from "typeorm";
import { Sections } from "@models/Sections";
import { Topics } from "@models/Topics";
import { auth_user } from 'src/utils';
import { Quizzes } from "@models/quiz/Quizzes";

// Tenta encontrar a seção
export async function getSection(request: APIRequest, response: Response, next: NextFunction) {
    const section_id = Number(request.params.section_id)

    const section = await getRepository(Sections).findOne({ id: section_id});

    if (!section) {
        return response.status(401).send({message: "Seção não encontrada"});
    }

    request.section = section;
    return next();
}

// Tenta encontrar um tópico
export async function getTopic(request: APIRequest, response: Response, next: NextFunction) {
    const id = Number(request.params.id);

    const topic = await getRepository(Topics).findOne({ 
        relations: ["author"],
        where: { id }
    });

    if (!topic)
        return response.send({message: "Tópico não encontrado"});

    request.topic = topic;
    

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
            return response.send({message: "Quiz não encontrado"});

        request.quiz = quiz;
    }

    return next();
}

// Tenta encontrar o usuário
export async function getUser(request: APIRequest, response: Response, next: NextFunction) {
    const token = request.headers.authorization;
    const user = await auth_user({ token, raiseError: false});
    if (user) 
        request.user = user;

    next();
}
