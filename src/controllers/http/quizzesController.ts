import { Response, NextFunction } from 'express';
import { Sections } from '@models/Sections';

import { APIRequest } from 'src/@types/global';
import { getRepository } from 'typeorm';
import { Quizzes } from '@models/quiz/Quizzes';

export default class QuizzesController {
    async list(request: APIRequest, response: Response, next: NextFunction) {
        const { section } = request;

        const quizzes = await getRepository(Quizzes)
            .find({
            relations: ['author', 'section'],
            where: { section: { id: section.id } }
            });

        return response.send(quizzes);
    }

    async create(request: APIRequest, response: Response, next: NextFunction) {
        const { section } = request;
        const { name } = request.body;
        const user = request.user.info;

        const new_quiz = new Quizzes();
        new_quiz.name = name;
        new_quiz.author = user;
        new_quiz.section = section;
        
        const saved_quiz = await getRepository(Quizzes).save(new_quiz);

        return response.send(saved_quiz);
    }
}
