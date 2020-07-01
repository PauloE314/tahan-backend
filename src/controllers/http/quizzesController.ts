import { Response, NextFunction } from 'express';
import { Sections } from '@models/Sections';

import { APIRequest } from 'src/@types/global';
import { getRepository } from 'typeorm';
import { Quizzes } from '@models/quiz/Quizzes';
import { Alternatives } from '@models/quiz/Alternatives';

export default class QuizzesController {
    async list(request: APIRequest, response: Response, next: NextFunction) {
        try {
            const { section } = request;

            const quizzes = await getRepository(Quizzes)
                .find({
                relations: ['author', 'section'],
                where: { section: { id: section.id } }
                });

            return response.send(quizzes);
        }
        catch(err) {
            return response.send({name: err.name, message: err.message})
        }
    }

    async create(request: APIRequest, response: Response, next: NextFunction) {
        const { section } = request;
        const { name } = request.body;
        const alternatives : { text: string, right?: boolean }[] = request.body.alternatives;
        const user = request.user.info;

        // const new_quiz = new Quizzes();
        // new_quiz.name = name;
        // new_quiz.author = user;
        // new_quiz.section = section;

        // const new_alternatives = alternatives.map(alt => {
        //     const new_alt = new Alternatives();
        //     new_alt.text = alt.text;

        //     return new_alt;
        // })
        // console.log(new_alternatives)
        // const saved_quiz = await getRepository(Quizzes).save(new_quiz);

        return response.send('nice');
    }
}
