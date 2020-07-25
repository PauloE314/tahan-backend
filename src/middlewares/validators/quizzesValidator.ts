import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";

import { getRepository } from "typeorm";
import { Validator } from "src/utils/classes";
import { Quizzes } from "@models/quiz/Quizzes";
import configs from "@config/server";




export default class QuizValidator extends Validator {

    // Validators de rota
    public create_validation = async (request: APIRequest, response: Response, next: NextFunction) =>  {
        this.clear();
        const { name, questions } = request.body;

        // Validação de nome do quiz
        await this.createFieldValidator({
            name: "name", data: name, validation: this.validate_name
        });

        // Validação das questões do quiz
        await this.createFieldValidator({
            name: "questions", data: questions, validation: this.validate_questions
        })
        

        // Resposta
        return this.answer(request, response, next);
    }

    // Update
    public update_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        this.clear();
        const { name, remove, add } = request.body;
        const user = request.user.info;

        if (user.id != request.quiz.author.id) 
            return response.status(401).send({message: "Apenas o criador do quiz pode alterá-lo"});

        // Valida o novo nome
        await this.createFieldValidator({
            name: "name", data: name, validation: this.validate_name, options: { currentName: request.quiz.name, optional: true }
        });

        // Valida as questões que serão removidas
        const remove_questions_validator = await this.createFieldValidator({
            name: "remove_questions", data: remove, validation: this.validate_remove_questions, options: { quiz: request.quiz, optional: true }
        });

        // Valida as questões que serão adicionadas
        const add_questions_validator = await this.createFieldValidator({
            name: "add_questions", data: add, validation: this.validate_questions, options: { optional: true, creating: false }
        });
        // Checa a quantidade total de questões
        if (remove_questions_validator.isValid && add_questions_validator.isValid) {
            const added = add_questions_validator.data ? add_questions_validator.data.length : 0;
            const removed = remove_questions_validator.data ? remove_questions_validator.data.length : 0;
            console.log("Total: " + (request.quiz.questions.length + added - removed))

            if (request.quiz.questions.length + added - removed < configs.quizzes.min_questions)
                return response.status(400).send({questions: "A quantidade mínima de questões é de " + configs.quizzes.min_questions});
        }

        return this.answer(request, response, next);
    }

    // Delete
    public delete_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        const user = request.user.info;
        const { quiz } = request;

        if (quiz.author.id !== user.id) {
            return response.status(401).send({message: "Apenas o criador do quiz pode alterá-lo"})
        }

        return next();
    }

    // Validação de resposta
    public answer_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        // Checa se existe a mesma quantidade de respostas e perguntas
        const { body, quiz } = request;
        // Checa se é um array de respostas
        if (!Array.isArray(body))
            return response.status(400).send({ message: "Envie uma lista de respostas "});
        // Checa se o número de pergunta e respostas é o mesmo
        if (quiz.questions.length !== body.length)
            return response.status(400).send({ message: "O número de respostas é insuficiente" });
        // Pega as respostas válidas
        const valid_answers = body.filter((answer: any) => (
            answer.question && answer.answer
        ));
        // Certifica se todas as respostas ainda são válidas
        if (quiz.questions.length !== valid_answers.length)
            return response.status(400).send({ message: "Questões mal-formatadas" });
        
        const answered_questions = valid_answers.map(valid_answer => valid_answer.question);
        // Certifica que toda questão tem uma resposta
        const no_answered_questions = {};
        for (let question of quiz.questions) 
            if (!answered_questions.includes(question.id))
                no_answered_questions['question-' + question.id] = 'no answered';
        // Caso haja questões sem respostas
        if (Object.keys(no_answered_questions).length)
            return response.status(400).send({ message: no_answered_questions})
        

        // Avança
        return next();
    }

    // Validação de estatísticas
    public games_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        // Checa se o professor é o criador do quiz
        if (request.user.info.id !== request.quiz.author.id)
            return response.status(401).send({ message: 'O usuário não é o autor do quiz' });

        return next();
    }

    /*
        Validadores de campo
    */

    // Validator de título
    private async validate_name (name: string | undefined, options?: { currentName: string }) {
        const currentName = options ? options.currentName : null;
        // Validação de título
        if (!name)
            return "Envie um nome para o quiz";

        if (name.length < 5)
            return "Envie um nome que tenha mais de 5 caracteres";

        const same_name_quiz = await getRepository(Quizzes).findOne({ name });
        if (same_name_quiz) {
            if (same_name_quiz.name !== currentName)
                return "Envie outro nome para o quiz, esse já foi escolhido anteriormente";
        }

        return;
    }

    private async validate_remove_questions (questions: number[], options: { quiz: Quizzes }) {
        const errs = <any>{};
        const questionsIdList = options.quiz.questions.map(question => question.id);

        if (!Array.isArray(questions))
            return "Envie uma lista com os IDs das questões a serem removidas";

        for (let questionId of questions)
            if (!questionsIdList.includes(questionId))
                errs[`question_${questionId}`] = "Essa questão não está presente no quiz";

        if (Object.keys(errs).length) {
            return errs;
        }
    }

    private validate_questions = async (questions: Array<any> | undefined, options?: { creating: boolean }) => { 
        const errors = <any>{};
        const creating = options ? options.creating : true;

        let index = 1;

        // Certifica que é um array
        if (!Array.isArray(questions)) {
            return 'Envie uma lista de questões'
        }

        // Verifica o número mínimo durante a criação
        if (questions.length < configs.quizzes.min_questions && creating) {
            return `Cada questão deve ter, no mínimo, ${configs.quizzes.min_questions} alternativas`;
        }
        
        // Valida cada questão
        for (let question of questions) {
            const question_index = "question_" + index;
            // Checa se os dados a questão é um objecto válido
            if (typeof question !== 'object' || Array.isArray(question) || !question)
                errors[question_index] = "Dado inválido";

            // Caso a base seja válida
            else {
                // Pega os erros das alternativas
                const alt_errors = this.validate_alternatives(question.alternatives);
                // Armazena os erros
                if (alt_errors)
                    errors[question_index] = { alternatives: alt_errors };

                // Pega os erros da resposta
                const answer_errors = this.validate_answer(question.alternatives);
                // Tenta armazenar os erros no objeto preexistente
                if (answer_errors) {
                    try {
                        errors[question_index].answer = answer_errors;
                    }
                    // Caso esse objeto não exista, cria ele
                    catch(err) {
                        errors[question_index] = { answer: answer_errors };
                    }
                }
            }
            // Próximo índice
            index++;
        }   

        // Retorna os erros
        if (Object.keys(errors).length)
            return errors;
    }


    private validate_alternatives (alternatives: Array<any> | undefined) {     
        const errors = <any>{};   
        // Checa se as alternativas existem
        if (!alternatives) 
            return "Envie as alternativas da questão";

        // Checa se as alternativas são um array
        if (!Array.isArray(alternatives)) 
            return "Envie uma lista de alternativas válida";

        // Número mínimo de alternativas por questão
        if (alternatives.length < configs.quizzes.min_alternatives) {
            return `Cada questão deve ter pelo menos ${configs.quizzes.min_alternatives} alternativas`;
        }

        // Número mínimo de alternativas por questão
        if (alternatives.length >= configs.quizzes.max_alternatives) {
            return `Cada questão deve menos de ${configs.quizzes.max_alternatives} alternativas`;
        }

        // Checa se todas as respostas estão válidas
        let index = 1;

        for (let alt of alternatives) {
            if (!alt)
                errors[index] = 'Envie alternativas válidas';
            
            // Checa se o dado é um objeto
            else {
                if (typeof alt == 'object' && !Array.isArray(alt)) {
                    if (!alt.hasOwnProperty('text'))
                        errors[index] = "Envie alternativas válidas - propriedade 'text' está faltando";
                    else
                        if (typeof alt.text !== 'string')
                            errors[index] = "Dado inválido"
                }
                // Retorna erro caso não seja
                else 
                    errors[index] = "Dado inválido em alternativa";
            }

            index++;
        }

        if (Object.keys(errors).length)
            return errors;

        return;
    }

    private validate_answer (alternatives: Array<any>) { 
        // Checa se existe apenas uma resposta nas alternativas
        const right_alternative = alternatives.filter(alt => typeof alt == 'object' ? alt.right : false);
        if (right_alternative.length !== 1) 
            return right_alternative.length < 1 ? "Envie uma resposta" : "Envie apenas uma resposta";

        return;
    }
}