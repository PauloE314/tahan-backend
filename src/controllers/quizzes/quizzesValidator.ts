import { BaseValidator, validateFields } from "src/utils/validators";
import { IValidCreateQuiz, IValidCreateQuestion } from "./quizzesTypes";
import { Quizzes } from "@models/quiz/Quizzes";
import { getRepository } from "typeorm";
import { ValidationError } from "src/utils";
import config from "src/config/server";
import { Topics } from "@models/Topics";

/**
 * Interfaces de validação
 */
interface ICreateQuizzesInput {
    name: any,
    mode: any,
    password: any,
    topic: any,
    questions: any
}

type ICreateQuestionsInput = Array<{
    question: any,
    alternatives: Array<{
        text: string,
        right?: boolean
    }>
}>

/**
 * Validador dos quizzes.
 */
export class QuizzesValidator extends BaseValidator {

    async createValidation({ name, mode, password, topic, questions }: ICreateQuizzesInput): IValidCreateQuiz {
        const questionValidator = new QuestionValidator();
        const { min_name_size: minNameSize, min_password_size: minPassSize} = config.quizzes;
        const modes = ['public', 'private'];
        const isPasswordOptional = mode !== 'private';

        
        const response = await validateFields({
            // Validação de nome de quiz
            name: {
                data: name,
                rules: q => q.isString().min(minNameSize).custom(isNameUnique)
            },
            // Validação de modo de jogo
            mode: {
                data: mode,
                rules: q => q.isString().isEqualTo(modes, 'Modo de quiz inválido')
            },
            // validação de senha
            password: {
                data: password,
                rules: q => q.isString().min(minPassSize),
                optional: isPasswordOptional
            },
            // Validação de tópico
            topic: {
                data: topic,
                rules: q => q.isNumber().custom(topicExists)
            },
            // Validação de questões
            questions: {
                data: questions,
                rules: q => q.isArray('object', {
                    array: 'Dado inválido', items: 'alternativa inválida'
                }).custom(questionValidator.createValidation.bind(questionValidator))
            }
        });

        return {
            name: response.name,
            mode: response.mode,
            password: response.password,
            topic: response.topic,
            questions: response.questions
        };
    }
}

/**
 * Validator de questões dos quizzes
 */
class QuestionValidator extends BaseValidator {

    /**
     * Valida a criação de questões
     */
    createValidation(input: ICreateQuestionsInput): IValidCreateQuestion {
        const response = [];
        const {
            min_alternatives: minAlt,
            max_alternatives: maxAlt,
            min_questions: minQuest,
            max_questions: maxQuest
        } = config.quizzes;
        // Valida quantidade de questões
        if (input.length < minQuest || input.length > maxQuest)
            this.RaiseError(`Quantidade inválida de questões`);

        // Valida cada questão
        for(const data of input) {
            let rightAlternative = false;
            // Certifica que a questão possui texto
            if (typeof data.question !== 'string')
                this.RaiseError('Questões inválida');

            // Certifica que a questão possui alternativas
            if (!Array.isArray(data.alternatives))
                this.RaiseError("Alternativas inválidas");

            // Certifica que a quantidade de alternativas é válida
            if (data.alternatives.length < minAlt || data.alternatives.length > maxAlt)
                this.RaiseError('Alternativas inválidas: quantidade incompatível');

            for(const alternative of data.alternatives) {
                // Certifica que cada alternativa possui um texto
                if (typeof alternative.text !== 'string')
                    this.RaiseError("Alternativas inválidas");

                // Certifica que só exista uma alternativa correta
                if (alternative.right !== undefined) {
                    if (rightAlternative)
                        this.RaiseError("Alternativas inválidas: mais de uma alternativa correta");

                    rightAlternative = alternative.right;
                }
            }

            // Certifica que existe uma alternativa correta
            if (!rightAlternative)
                this.RaiseError("Questões inválidas: questão sem resposta correta");

            response.push(data);
        }

        return response;
    }
}


/**
 * Valida o nome do quiz
 */
async function isNameUnique (name: string, currentName?: string) {
    // Validação de unicidade
    const same_name_quiz = await getRepository(Quizzes).findOne({ 
        where: { name }
    });
    if (same_name_quiz) {
        if (same_name_quiz.name !== currentName)
            throw new ValidationError("Nome já escolhido anteriormente");
    }
    return name;
}

/**
 * Certifica que o tópico existe
 */
async function topicExists (id: number) {
    // Validação de unicidade
    const topic = await getRepository(Topics).findOne(id);
    if (!topic) 
        throw new ValidationError("Tópico inválido");
    return topic;
}
