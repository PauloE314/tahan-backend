import { APIRequest } from "../@types";
import { Response, NextFunction } from "express";



interface validation_errors {
    name: string,
    message: any
}

type method = (data: any, options: any) => Promise<any>;

interface method_list {
    [name: string]: method
}

/**
 * Validador de rotas
 */
export class Validator {
    public errors: Array<validation_errors>;
    private methods: method_list;
    

    constructor(methods?: method_list) {
        const custom_methods = methods ? methods : {};
        // Salva métodos do usuário e predefinidos
        this.methods = { ...custom_methods, is_array, is_string, is_object, is_number };
        // Zera os erros
        this.errors = [];
    }

    /**
     * Retorna se tais campos são são válidos 
     */
    public are_all_valid(input: Array<string>) {
        for (const field of input) {
            if (this.errors[field] !== undefined)
                return false;
        }
        return true
    }

    /**
     * Valida o campo passado como parâmetro
     */
    public async validate(input: {[name: string]: any}, methods: Array<method>, options?: any) {
        // Pega os dados do objeto
        const op = options ? options : { optional: false, save: true };
        const name = Object.keys(input)[0];
        const data = input[name];
        const save = op.save !== false;

        // Checa se o dado é opcional
        if (data == undefined)
            if (op.optional)
                return;

        // Testa o dado em cada validator
        for(const method of methods) {

            // Executa o método
            const response = await method(data, options);

            // Lida com os erros
            if (response !== null && response !== undefined) {
                const err = { name, message: response };
                // Salva
                if (save)
                    this.errors.push(err);

                return err;
            }
        }
        return;
    }

    /**
     * Retorna a resposta para o usuário
     */
    public resolve(request: APIRequest, response: Response, next: NextFunction) {
        
        const returning_errors = {};
        // Checa se há um erro
        for (const error of this.errors) {
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
 * Validator simples que checa se um elemento é uma string
 */
export async function is_string (data: any, options: any) {
    if (data == undefined)
        return "Esse dado é obrigatório";
        
    if (typeof data !== 'string' && !(data instanceof String)) {
        return `Esse formato de dado não é válido (esperado: string, obtido: ${typeof data})`;
    }
}

/**
 * Validator simples que checa se um elemento é um array
 */
export async function is_array (data: any, options: any) {
    if (data == undefined)
        return "Esse dado é obrigatório";

    if (!Array.isArray(data)) {
        return `Esse formato de dado não é válido (esperado: array, obtido: ${typeof data})`;
    }
}

/**
 * Validator simples que checa se um elemento é um objeto
 */
export async function is_object (data: any, options: any) {
    if (data == undefined)
        return "Esse dado é obrigatório";

    if (Array.isArray(data) || (typeof data !== 'object' && !(data instanceof Object))) {
        return `Esse formato de dado não é válido (esperado: object, obtido: ${typeof data})`;
    }

}


/**
 * Validator simples que checa se um elemento é um número
 */
export async function is_number (data: any, options: any) {
    if (data == undefined)
        return "Esse dado é obrigatório";
    
    if (typeof data !== 'number' && !(data instanceof Number)) {
        return `Esse formato de dado não é válido (esperado: number, obtido: ${typeof data})`;
    }
}