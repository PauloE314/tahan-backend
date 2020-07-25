import { Response, NextFunction } from 'express';
import { Topics } from '@models/Topics';

import { APIRequest } from 'src/@types';
import { getRepository, getConnection, Like } from 'typeorm';
import { Quizzes } from '@models/quiz/Quizzes';
import { Alternatives } from '@models/quiz/Alternatives';
import { Questions } from '@models/quiz/Questions';
import { connect } from 'net';
import { SingleGames } from '@models/games/SingleGames';
import { GameHistoric } from '@models/games/GameHistoric';
import { PlayerScore } from '@models/games/PlayerScore';

interface InputQuestion { 
    question: string,
    alternatives: {
        text: string,
        right?: boolean
    }[]
};

interface UserAnswer {
    question: number,
    answer: number
}

/**
 * Controlador de quizzes da aplicação
 */
export default class QuizzesController {
    // Lista todos os quizzes
    async list(request: APIRequest, response: Response, next: NextFunction) {
        try {
            const { topic } = request;
            const where = <any>{ topic: { id: topic.id } };

            // Armazena o nome do queries params
            const { name } = request.query;
            if (name) 
                where.name = Like(`%${name}%`);
            
            // Encontra a lista de quizzes que batem com a pesquisa
            const quizzes = await getRepository(Quizzes)
                .find({
                    relations: ['author', 'topic'],
                    where
                });

            // Retorna os quizzes
            return response.send(quizzes);
        }
        catch(err) {
            return response.send({name: err.name, message: err.message})
        }
    }

    /* Criação de quiz */
    async create(request: APIRequest, response: Response, next: NextFunction) {
        const { topic } = request;
        const { name } = request.body;
        const questions : InputQuestion[] = request.body.questions;
        const user = request.user.info;

        // Cria um query_runner para as transactions
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {

            const new_quiz = new Quizzes();
            new_quiz.name = name;
            new_quiz.author = user;
            new_quiz.topic = topic;

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
            
            const full_quiz = await queryRunner.manager.find(Quizzes, {
                relations: ['questions', 'questions.alternatives', 'questions.rightAnswer'],
                where: {
                    id: saved_quiz.id
                }
            });

            // Roda as transactions;
            await queryRunner.commitTransaction();

            return response.send(full_quiz);
        }
        // Caso ocorra um erro, dá rollback
        catch(err) {
            await queryRunner.rollbackTransaction();

            return response.send({name: err.name, message: err.message})
        } finally {
            await queryRunner.release();
        }        
    }

    /* Ler o quiz */
    async read(request: APIRequest, response: Response, next: NextFunction) {
        const { quiz } = request;

        return response.send(quiz);
    }


    /* Dá update no quiz */
    async update(request: APIRequest, response: Response, next: NextFunction) {
        const { name, remove } = request.body;
        const add : InputQuestion[] = request.body.add;
        const { quiz } = request;

        // Renomear quiz
        if (name)
            quiz.name = name;

        // Inicia a transaction
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();

        await queryRunner.startTransaction();


        try {
            if (remove) {
                for (let question of remove) {
                    quiz.questions = quiz.questions.filter(quest => quest.id !== question);
                    await queryRunner.manager.delete(Questions, { id: question });
                }
                await queryRunner.manager.save(quiz);
            }

            if (add) {
                // Cria as novas questões
                for (let quest of add) {
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

            // Aplica as transactions
            await queryRunner.commitTransaction();
            // Pega os dados totais do quiz
            const full_quiz = await queryRunner.manager.find(Quizzes, {
                relations: ['questions', 'questions.alternatives', 'questions.rightAnswer'],
                where: {
                    id: quiz.id
                }
            });

            return response.send(full_quiz);
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

    /* Delete no quiz */
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

    /* Permite que um aluno responda as questões */
    async answer(request: APIRequest, response: Response, next: NextFunction) {
        try{
        const { user, quiz } = request;
        const body: Array<UserAnswer> = request.body;
        // Corrige as questões
        const answers = body.map(answer => {
            const question = quiz.questions.find(question => question.id === answer.question);
            return {
                question: question.id,
                answer: answer.answer,
                rightAnswer: question.rightAnswer.id,
                isRight: question.rightAnswer.id === answer.answer
            };
        });
        // Pega a lista de respostas corretas
        const correct_answers = answers.filter(answer => answer.isRight);
        // Score do usuário
        const score = (correct_answers.length / quiz.questions.length) * 10;

        // Cria o score do player
        const player_score = new PlayerScore();
        player_score.player = user.info;
        player_score.score = score;

        // Registra o jogo
        const game = new GameHistoric();
        game.is_multiplayer = false;
        game.player_1_score = player_score;
        game.quiz = quiz;
        // Salva o jogo
        await getRepository(GameHistoric).save(game);
        // Retorna os dados
        return response.send({ answers, score });
        }
        catch(err) {
            return response.send(err.message)
        }
    }

    /* Permite o professor pegar as estatísticas dos quizzes */
    async games(request: APIRequest, response: Response, next: NextFunction) {
        const quiz = request.quiz;
        // Pega lista de jogos com o quiz especificado na URL
        const game_historic = await getRepository(GameHistoric).find({
            relations: ['player_1_score', 'player_1_score.player', 'player_2_score', 'player_2_score.player', 'quiz'],
            where: {
                quiz: { id: quiz.id }
            }
        });

        return response.send(game_historic);
    }
}
