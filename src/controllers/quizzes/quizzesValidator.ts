import { BaseValidator, validateFields } from "src/utils/validators";
import { IValidCreateQuiz, IValidQuestions } from "./quizzesTypes";
import { Quizzes } from "@models/quiz/Quizzes";
import { getRepository } from "typeorm";
import { ValidationError } from "src/utils";
import config from "src/config/server";
import { Topics } from "@models/Topics";
import { Users } from "@models/User";

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

interface IUpdateQuizzesInput {
    quiz: Quizzes,
    name?: any,
    mode?: any,
    password?: any,
    topic?: any,
    add?: any,
    remove?: any
}

interface IQuizAnswerInput {
    quiz: Quizzes,
    answers: any
}


/**
 * Validador dos quizzes.
 */
export class QuizzesValidator extends BaseValidator {
    // Regras estáticas do validator
    rules = {
        minNameSize: config.quizzes.min_name_size,
        minPassSize: config.quizzes.min_name_size,
        minQuestSize: config.quizzes.min_questions
    };

    async createValidation({ name, mode, password, topic, questions }: ICreateQuizzesInput): IValidCreateQuiz {
        const { minNameSize, minPassSize } = this.rules;
        const questionValidator = new QuestionValidator();
        const modes = ['public', 'private'];
        const isPasswordOptional = mode !== 'private';

        
        const response = await validateFields({
            // Validação de nome de quiz
            name: {
                data: name,
                rules: q => q.isString().min(minNameSize).custom(isNameUnique())
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
                }).custom(questionValidator.createValidation().bind(questionValidator))
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

    /**
     * Valida a atualização de um quiz
     */
    async updateValidation({ mode, name, password, add, remove, topic, quiz }: IUpdateQuizzesInput) {
        const { minNameSize, minPassSize, minQuestSize } = this.rules;
        const modes = ['public', 'private'];
        const questionIdList = quiz.questions.map(quest => quest.id);
        const isPasswordOptional = mode !== 'private';
        
        const questionValidator = new QuestionValidator();

        const removeSize = remove ? remove.length || 0 : 0;
        const addSize = add ? add.length || 0 : 0;
        const actualSize = quiz.questions.length;

        // Certifica que a quantidade de questões ainda será válida
        if ((actualSize + addSize - removeSize < minQuestSize) && (actualSize >= minQuestSize))
            this.RaiseError({ questions: "Quantidade resultante de questões inválida" });

        if ((addSize - removeSize < 0) && (actualSize < minQuestSize))
            this.RaiseError({ questions: "Quantidade resultante de questões inválida" });

        
        const response = await validateFields({
            // Validação de nome de quiz
            name: {
                data: name,
                rules: q => q.isString().min(minNameSize).custom(isNameUnique(quiz.name)),
                optional: true
            },
            // Validação de modo de jogo
            mode: {
                data: mode,
                rules: q => q.isString().isEqualTo(modes, 'Modo de quiz inválido'),
                optional: true
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
                rules: q => q.isNumber().custom(topicExists),
                optional: true
            },
            // Validação criação de questões
            add: {
                data: add,
                rules: q => q.isArray('object', {
                    array: 'Dado inválido', items: 'Questão inválida'
                }).custom(questionValidator.createValidation(false).bind(questionValidator)),
                optional: true
            },
            remove: {
                data: remove,
                rules: q => q.isArray("number", {
                    array: "Dado inválido", items: "Questão inválida"
                }).custom(isRemoveQuestionValid(questionIdList)),
                optional: true
            }
        });

        return {
            name: response.name,
            mode: response.mode,
            password: response.password,
            topic: response.topic,
            add: response.add,
            remove: response.remove
        };
    }

    /**
     * Validação de resposta de quiz
     */
    validateQuizAnswer({ answers, quiz }: IQuizAnswerInput) {
        const questionList = quiz.questions.map(res => res.id);
        const answeredQuestions: Array<number> = [];

        // Certifica que é um array
        if (!Array.isArray(answers))
            this.RaiseError({ answers: "Dado inválido" });

        // Valida a quantidade de questões
        if (answers.length !== questionList.length)
            this.RaiseError({ answers: "Quantidade inválida de respostas" });

        for (const response of answers) {
            const { answer, question } = response;

            // Valida a quantidade de respostas
            if (answer === undefined || question === undefined)
                this.RaiseError({ answers: "Resposta mal formatada"});
            
            // Certifica que cada resposta terá apenas uma pergunta
            if (!questionList.includes(question) || answeredQuestions.includes(question))
                this.RaiseError({ answers: "Resposta inválida" });

            answeredQuestions.push(question);
        }
        
        return <Array<{ question: number, answer: number }>>answers;
    }

    /**
     * Checa se um usuário é o autor de um quiz
     */
    isQuizAuthor({ quiz, user }: { quiz: Quizzes, user: Users }) {
        if (quiz.author.id !== user.id )
            this.RaiseError("Permissão negada, essa ação só é permitida ao autor do quiz", 401);

        return quiz;
    }
}




type ICreateQuestionsInput = Array<{
    question: any,
    alternatives: Array<{
        text: string,
        right?: boolean
    }>
}>

/**
 * Validator de questões dos quizzes
 */
class QuestionValidator extends BaseValidator {

    /**
     * Valida a criação de questões
     */
    createValidation(validateSize?: boolean) {
        return function (input: ICreateQuestionsInput): IValidQuestions {
            const response = [];
            const {
                min_alternatives: minAlt,
                max_alternatives: maxAlt,
                min_questions: minQuest,
                max_questions: maxQuest
            } = config.quizzes;

            const validateQuestSize = validateSize !== undefined ? validateSize : true; 

            // Valida quantidade de questões
            if (validateQuestSize)
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
}


/**
 * Valida o nome do quiz
 */
function isNameUnique (currentName?: string) {
        return async function (name: string) {
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

/**
 * Certifica que a remoção de questões é válida
 */
function isRemoveQuestionValid(idList: Array<number>) {
    return function (data: Array<any>) {
        for(const element of data) {
            if (!idList.includes(element))
                throw new ValidationError("Questão inexistente");
                
        }
        return data;
    }
}