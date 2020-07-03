import { Response, NextFunction } from 'express';
import { Sections } from '@models/Sections';

import { APIRequest } from 'src/@types';
import { getRepository, getConnection, Like } from 'typeorm';
import { Quizzes } from '@models/quiz/Quizzes';
import { Alternatives } from '@models/quiz/Alternatives';
import { Questions } from '@models/quiz/Questions';
import { connect } from 'net';

interface InputQuestion { 
    question: string,
    alternatives: {
        text: string,
        right?: boolean
    }[]
}

export default class QuizzesController {
    async list(request: APIRequest, response: Response, next: NextFunction) {
        try {
            const { section } = request;
            const where = <any>{ section: { id: section.id } };

            // Armazena o nome do queries params
            const { name } = request.query;
            if (name) 
                where.name = Like(`%${name}%`);
            
            // Encontra a lista de quizzes que batem com a pesquisa
            const quizzes = await getRepository(Quizzes)
                .find({
                    relations: ['author', 'section', 'questions'],
                    where
                });

            // Retorna os quizzes
            return response.send(quizzes);
        }
        catch(err) {
            return response.send({name: err.name, message: err.message})
        }
    }

    // Criação de quiz
    async create(request: APIRequest, response: Response, next: NextFunction) {
        const { section } = request;
        const { name } = request.body;
        const questions : InputQuestion[] = request.body.questions;
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
                        // console.log(' ...  certo');
                        saved_question.rightAnswer = new_alternative;
                        await getRepository(Questions).save(saved_question);
                        // console.log(' ...  salvo');
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

    // Ler o quiz
    async read(request: APIRequest, response: Response, next: NextFunction) {
        const { quiz } = request;

        return response.send(quiz);
    }


    // Dá update no quiz
    async update(request: APIRequest, response: Response, next: NextFunction) {
        const { name, remove_questions } = request.body;
        const add_questions : InputQuestion[] = request.body.add_questions;
        const { quiz } = request;

        // Renomear quiz
        if (name)
            quiz.name = name;

        // Inicia a transaction
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            if (remove_questions) {
                for (let question of remove_questions) {
                    quiz.questions = quiz.questions.filter(quest => quest.id !== question);
                    await queryRunner.manager.delete(Questions, { id: question });
                }
                await queryRunner.manager.save(quiz);
            }

            if (add_questions) {
                // Cria as novas questões
                for (let quest of add_questions) {
                    const question = new Questions();
                    question.question = quest.question;
                    question.quiz = quiz;
                    // Salva-as
                    await queryRunner.manager.save(question);

                    // Cria as alternativas da questão
                    for (let alt of quest.alternatives) {
                        const new_alternative = new Alternatives();
                        new_alternative.text = alt.text;
                        new_alternative.question = question;
                        // Caso seja a certa, cria a devida relação com a questão
                        if (alt.right)
                            new_alternative.rightAnswerQuestion = question;
                        // Salva a alternativa
                        await queryRunner.manager.save(new_alternative);
                    }
                }
            }

            const full_quizz = await queryRunner.manager.find(Quizzes, {
                relations: ['questions', 'questions.alternatives', 'questions.rightAnswer'],
                where: {
                    id: quiz.id
                }
            });

            // Aplica as transactions
            await queryRunner.commitTransaction();

            return response.send(full_quizz);
            // Remover questões inválidas
            }
        catch(err) {
            queryRunner.rollbackTransaction();

            return response.status(500).send({name: err.name, message: err.message});
        }
        finally{
            queryRunner.release();
        }
    }

    // Delete no quiz
    async delete(request: APIRequest, response: Response, next: NextFunction) {
        try {
            const { quiz } = request;

            await getRepository(Quizzes).remove(quiz);

            return response.send({ message: "Quiz deletado com sucesso" })
        }
        catch(err) {
            return response.send({name: err.name, message: err.message})
        }
    }
}
