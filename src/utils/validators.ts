import { APIRequest } from "../@types";
import { Response, NextFunction } from "express";


interface field_validation {
    [name: string]: {
        method: (data: any, options: any) => Promise<any>
    }
}

interface errors {
    [name: string]: {
        name: string
        message: any,
    }
}

// Lista de validators de campo padrão
const default_field_validators: field_validation = {
    is_array: { method: is_array },
    is_string: { method: is_string },
    is_object: { method: is_object },
    is_number: { method: is_number },

};

/**
 * Class destinada a validação de dados de rotas.
 */
export class Validator {
    private field_validators: field_validation = default_field_validators;

    public validators: field_validation;

    /**
     * Validação de item. Certifica que o item será válido em todos os métodos passados como parâmetro
     */
    public async validate(input: { name: string, data: any, methods: Array<string>, options?: any }) {
        const { data, name } = input;

        for (const validator_name of input.methods) {
            const validator = this.field_validators[validator_name] || this.validators[validator_name];
            // Executa método direto
            const op = input.options ? input.options : { optional: false };
            
            // Checa se o campo é opcional
            if (data == undefined)
                if (op.optional)
                    return;

            // Executa validação
            const message = await validator.method(data, op);
            // Salva um possível erro
            if (message) {
                const new_error = new FieldError(name, message);
                return new_error;
            }
        }
        return;
    }

    /**
     * Aplica os validators de campo. Caso algum dos validators seja ativado, retorna a mensagem de erro
     */
    public resolve(request: APIRequest, response: Response, next: NextFunction, errors: Array<FieldError>) {
        const returning_errors = {};
        // Checa se há um erro
        for (const error of errors) {
            if (error)
                returning_errors[error.name] = error.message;
        }
        // Retorna os errors
        if (Object.keys(returning_errors).length)
            return response.status(400).send({
                message: returning_errors
            });
        // Retorna para a próxima
        return next();
    }
}


/**
 * Objeto de erro de campo
 */
class FieldError {
    name: string;
    message: any;

    constructor(name: string, message: any) {
        this.name = name;
        this.message = message;
    }
}



/**
 * Validator simples que checa se um elemento é uma string
 */
async function is_string (data: any, options: any) {
    if (typeof data !== 'string' && !(data instanceof String)) {
        return `Esse formato de dado não é válido (esperado: string, obtido: ${typeof data})`;
    }
}

/**
 * Validator simples que checa se um elemento é um array
 */
async function is_array (data: any, options: any) {
    if (!Array.isArray(data)) {
        return `Esse formato de dado não é válido (esperado: array, obtido: ${typeof data})`;
    }
}

/**
 * Validator simples que checa se um elemento é um objeto
 */
async function is_object (data: any, options: any) {
    if (Array.isArray(data) || (typeof data !== 'object' && !(data instanceof Object))) {
        return `Esse formato de dado não é válido (esperado: object, obtido: ${typeof data})`;
    }

}


/**
 * Validator simples que checa se um elemento é um número
 */
async function is_number (data: any, options: any) {
    if (typeof data !== 'number' && !(data instanceof Number)) {
        return `Esse formato de dado não é válido (esperado: object, obtido: ${typeof data})`;
    }
}