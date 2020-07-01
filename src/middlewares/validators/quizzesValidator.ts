import { APIRequest } from "src/@types/global";
import { Response, NextFunction } from "express";

import { Topics } from '@models/Topics';
import { getRepository } from "typeorm";
import { Validator } from "src/utils/classes";
import { Quizzes } from "@models/quiz/Quizzes";




export default class QuizValidator extends Validator {

    // Validators de rota
    public create_validation = async (request: APIRequest, response: Response, next: NextFunction) =>  {
        this.clear();
        const { name, questions } = request.body;

        // Validação de nome do quizz
        await this.createFieldValidator({
            name: "name", data: name, validation: this.validate_name
        });

        // Validação das questões do quizz
        await this.createFieldValidator({
            name: "questions", data: questions, validation: this.validate_questions
        })
        

        // Resposta
        return this.answer(request, response, next);
    }




    // Validators de campos
    // Validator de título
    private async validate_name (name: string | undefined) {
        // Validação de título
        if (!name)
            return "Envie um nome para o quizz";

        if (name.length < 5)
            return "Envie um nome que tenha mais de 5 caracateres";

        const same_name_quiz = await getRepository(Quizzes).findOne({ name });
        if (same_name_quiz) 
            return "Envie outro nome para o quiz, esse já foi escolhido anteriormente";

        return;
    }

    private validate_questions = async (questions: Array<any> | undefined) => { 
        const errors = <any>{};
        let index = 1;

        if (!Array.isArray(questions)) {
            return 'Envie uma lista de questões'
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
                // Amazena os erros
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