import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";

import { getRepository } from "typeorm";
import { Validator, is_string, is_array } from "src/utils/validators";
import { Quizzes } from "@models/quiz/Quizzes";
import configs from "@config/server";
import { Questions } from "@models/quiz/Questions";




export default class QuizValidator {

    /**
     * **Validação de criação de quiz.**
     * 
     * topics/:number/quizzes/ - POST
     */
    public async create_validation (request: APIRequest, response: Response, next: NextFunction) {
        const { name, questions } = request.body;
        const validator = new Validator();

        // Validação de nome do quiz
        await validator.validate({ name }, [is_string, validate_name]);

        // Validação das questões do quiz
        await validator.validate({ questions }, [is_array, validate_questions], { creating: true })
        
        // Resposta
        return validator.resolve(request, response, next);
    }

    /**
     * **Validação para atualizar um quiz.**
     * 
     * topics/:number/quizzes/:number - PUT
     */
    public async update_validation (request: APIRequest, response: Response, next: NextFunction) {
        const { name, remove, add } = request.body;
        const quiz = request.quiz;
        const user = request.user.info;
        const validator = new Validator();

        // Checa se o usuário é o autor
        if (user.id != request.quiz.author.id) 
            return response.status(401).send({message: "Apenas o criador do quiz pode alterá-lo"});

        // Valida o novo nome
        await validator.validate(
            { name },
            [is_string, validate_name],
            { currentName: request.quiz.name, optional: true }
        );

        // Valida as questões que serão removidas
        const remove_validation = await validator.validate(
            { remove },
            [is_array, validate_remove_questions],
            { optional: true, quiz }
        );

        // Valida as questões que serão adicionadas
        const add_validation = await validator.validate(
            { add },
            [is_array, validate_questions],
            { optional: true, creating: false }
        );
        // Checa a quantidade total de questões
        if (!remove_validation && !add_validation) {
            const questions = { add: add ? add.length : 0, remove: remove ? remove.length : 0 };
            const original_amount = quiz.questions.length;
            await validator.validate({ questions }, [validate_amount], { original_amount });
        }

        // Resposta
        return validator.resolve(request, response, next);
    }

    /**
     * Validação para apagar um quiz
     * 
     * topics/:number/quizzes/:number - DELETE
     */
    public delete_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        const user = request.user.info;
        const { quiz } = request;

        if (quiz.author.id !== user.id) {
            return response.status(401).send({ message: "Apenas o criador do quiz pode alterá-lo" })
        }

        return next();
    }

    /**
     * Validação para resposta de jogos individuais do quiz.
     * 
     * topics/:number/quizzes/:number/answer - POST
     */
    public async answer_validation  (request: APIRequest, response: Response, next: NextFunction) {
        const { body, quiz } = request;
        const validator = new Validator();

        // Validator de resposta
        await validator.validate(
            { answer: body },
            [is_array, validate_answers],
            { questions: quiz.questions }
        );
    
        // Resposta
        return validator.resolve(request, response, next);
    }

    /**
     * **Validação para ver as estatísticas de jogo.**
     * 
     * topics/:number/quizzes/:number/games
     */
    public games_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        // Checa se o professor é o criador do quiz
        if (request.user.info.id !== request.quiz.author.id)
            return response.status(401).send({ message: { user: 'O usuário não é o autor do quiz' }});

        return next();
    }
}




/*
    Validadores de campo
*/

// Validator de título
async function validate_name (name: string | undefined, options?: { currentName: string }) {
    const currentName = options ? options.currentName : null;
    // Validação de título
    if (name.length < 5)
        return "Envie um nome que tenha mais de 5 caracteres";

    const same_name_quiz = await getRepository(Quizzes).findOne({ name });
    if (same_name_quiz) {
        if (same_name_quiz.name !== currentName)
            return "Envie outro nome para o quiz, esse já foi escolhido anteriormente";
    }
    return;
}

/**
 * Validação de quantidade de questões
 */
async function validate_amount (data: {add: number, remove: number}, options: { original_amount: number }) {
    if (data.add + options.original_amount - data.remove < configs.quizzes.min_questions)
        return `A quantidade mínima de questões no quiz é: ${configs.quizzes.min_questions}`;
}

/**
 * Validação das questões que serão removidas
 */
async function validate_remove_questions (questions: number[], options: { quiz: Quizzes }) {
    const questions_id_list = options.quiz.questions.map(question => question.id);

    for (let question_id of questions)
        if (!questions_id_list.includes(question_id))
            return "Questão não presente no quiz";
}

/**
 * Validação das questões do quiz
 */
async function validate_questions(questions: Array<any> | undefined, options?: { creating: boolean }) { 
    const creating = options ? options.creating : true;

    // Verifica o número mínimo durante a criação
    if (questions.length < configs.quizzes.min_questions && creating) {
        return `Cada questão deve ter, no mínimo, ${configs.quizzes.min_questions} alternativas`;
    }
    
    // Valida cada questão
    for (let question of questions) {
        // Checa se os dados a questão é um objecto válido
        if (typeof question !== 'object' || Array.isArray(question) || !question)
            return "Dados inválidos";

        // Checa se o texto da questão existe
        if (typeof question.question !== 'string')
            return { question: 'Dado inválido' }
        
        // Pega os erros das alternativas
        const alt_errors = await validate_alternatives(question.alternatives);
        // Armazena os erros
        if (alt_errors)
            return { alternatives: alt_errors };

        // Pega os erros da resposta
        const answer_errors = await validate_right_answer(question.alternatives);
        // Tenta armazenar os erros no objeto preexistente
        if (answer_errors) 
            return { right_answer: answer_errors };   
        
    }   
}


async function validate_alternatives (alternatives: Array<any> | undefined) {     
    // Checa se as alternativas existem
    if (!alternatives) 
        return "Envie as alternativas da questão";

    // Número mínimo de alternativas por questão
    if (alternatives.length < configs.quizzes.min_alternatives) {
        return `Cada questão deve ter pelo menos ${configs.quizzes.min_alternatives} alternativas`;
    }

    // Número máximo de alternativas por questão
    if (alternatives.length >= configs.quizzes.max_alternatives) {
        return `Cada questão deve menos de ${configs.quizzes.max_alternatives} alternativas`;
    }

    // Checa se todas as respostas estão válidas
    for (let alt of alternatives) {
        if (!alt)
            return 'Alternativas faltando';
        
        // Checa se o dado é um objeto
        else {
            if (typeof alt == 'object' && !Array.isArray(alt)) {
                const text = alt.text;
                if (!text)
                    return "Alternativa inválida - propriedade 'text' está faltando";
                
                if (typeof alt.text !== 'string')
                    return "Dado inválido";
            }
            // Retorna erro caso não seja
            else 
                return "Dado inválido";
        }
    }

    return;
}

/**
 * Certifica que a questão possui uma resposta correta
 */
async function validate_right_answer (alternatives: Array<any>) { 
    // Checa se existe apenas uma resposta nas alternativas
    const right_alternative = alternatives.filter(alt => typeof alt == 'object' ? alt.right : false);
    if (right_alternative.length !== 1) 
        return right_alternative.length < 1 ? "Envie uma resposta" : "Envie apenas uma resposta";

    return;
}

/**
 * Valida as resposta do aluno 
 */
async function validate_answers (data: Array<any>, options: { questions: Array<Questions> }) {
    const { questions } = options;
    // Valida quanto a quantidade de questões
    if (data.length !== questions.length)
        return "Quantidade de resposta insuficiente";

    const answered_questions = [];
    const questions_ids = questions.map(question => question.id);

    for (const resp of data) {
        const { question, answer } = resp;
        // Certifica que há a resposta e a pergunta
        if (!question || !answer)
            return "Resposta mal formatada";
        // Certifica que cada resposta terá apenas uma pergunta
        if (!questions_ids.includes(question) || answered_questions.includes(question))
            return "Resposta inválida";

        answered_questions.push(question);
    }

}