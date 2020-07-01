import { Response, NextFunction } from 'express';
import { Sections } from '@models/Sections';

import { APIRequest } from 'src/@types/global';
import { getRepository, getConnection } from 'typeorm';
import { Quizzes } from '@models/quiz/Quizzes';
import { Alternatives } from '@models/quiz/Alternatives';
import { Questions } from '@models/quiz/Questions';

export default class QuizzesController {
    async list(request: APIRequest, response: Response, next: NextFunction) {
        try {
            const { section } = request;

            const quizzes = await getRepository(Quizzes)
                .find({
                    relations: ['author', 'section', 'questions'],
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
        const questions : { question: string, alternatives: { text: string, right?: boolean }[] }[] = request.body.questions;
        const user = request.user.info;

        // Cria um queryrunner para as transactions
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {

            const new_quiz = new Quizzes();
            new_quiz.name = name;
            new_quiz.author = user;
            new_quiz.section = section;

            const saved_quiz = await queryRunner.manager.save(new_quiz);

            // Criar questões
            for (let question of questions) {

                // Criar a questão
                const new_question = new Questions();
                new_question.question = question.question;
                new_question.quiz = saved_quiz;

                // const saved_question = new_question;
                const saved_question = await queryRunner.manager.save(new_question);
            

                // Criar as alternativas
                const { alternatives } = question;

                for (let alt of alternatives) {
                    // Criar alternativa
                    const new_alternative = new Alternatives();
                    new_alternative.text = alt.text;
                    new_alternative.question = saved_question;

                    await queryRunner.manager.save(new_alternative);
                    // Se a alternativa for a correta, salva ela
                    if (alt.right) {
                        console.log(' ...  certo');
                        saved_question.rightAnswer = new_alternative;
                        await getRepository(Questions).save(saved_question);
                        console.log(' ...  salvo');
                    }    
                }
            }
            
            const full_quizz = await queryRunner.manager.find(Quizzes, {
                relations: ['questions', 'questions.alternatives', 'questions.rightAnswer'],
                where: {
                    id: saved_quiz.id
                }
            });

            // Roda as transactions;
            await queryRunner.commitTransaction();

            return response.send(full_quizz);
        }
        // Caso ocorra um erro, dá rollback
        catch(err) {
            await queryRunner.rollbackTransaction();

            return response.send({name: err.name, message: err.message})
        } finally {
            await queryRunner.release();
        }

        
    }

    async read(request: APIRequest, response: Response, next: NextFunction) {
        const id = Number(request.params.id);
        if (isNaN(id))
            return next();

        return response.send(request.quiz);
    }
}
