import { APIRequest } from "../@types";
import { Response, NextFunction, response } from "express";
import { ValidationError, auth_user } from ".";



interface validation_errors {
    name: string,
    message: any
}

type method = (data: any, options: any) => Promise<any> | any;

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
                return {
                    is_valid: true,
                    data: null,
                    errors: null
                }

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

                // Retorna resposta adequada
                return {
                    is_valid: false,
                    data,
                    error: err
                }
            }
        }
        return {
            is_valid: true,
            data
        };
    }

    /**
     * Retorna a resposta para o usuário
     */
    public resolve(request: APIRequest, response: Response, next: NextFunction, status_code?: number) {
        const code = status_code ? status_code : 400;
        const returning_errors = {};
        // Checa se há um erro
        for (const error of this.errors) {
            if (error)
                returning_errors[error.name] = error.message;
        }
        // Retorna os errors
        if (Object.keys(returning_errors).length)
            return response.status(code).send({
                message: returning_errors
            });
        // Retorna para a próxima
        return next();
    }
}


/**
 * Validador de elementos. Permite validar campos de forma dinâmica
 */
export class ElementValidator {
    rules: Array<IRule> = [];

    /**
     * Permite a criação de uma nova regra customizada.
     */
    custom (cb: IRule) {
        this.rules.push(cb);
        
        return this;
    }
    /**
     * Regra que certifica que o elemento existe.
     */
    exists(message?: string) {
        this.rules.push(
            (data: any) => {
                if (data == undefined)
                    throw new ValidationError(message || "Esse dado é obrigatório");

                return data;
            }
        )
        return this;
    }

    /**
     * Regra que certifica que o elemento não existe.
     */
    notExists(message?: string) {
        this.rules.push(
            (data: any) => {
                if (data != undefined)
                    throw new ValidationError(message || "Esse dado não deveria existir");

                return data;
            }
        )
        return this;
    }
    
    /**
     * Regra que certifica que o elemento é uma string
     */
    isString(message?: string) {
        this.exists();

        this.rules.push(
            (data: any) => {

                if (typeof data !== "string")
                    throw new ValidationError(message || "Tipo de dado inválido; esperado: string, recebido: " + typeof data);
                return data;
            }
        )
        return this;
    }

    /**
     * Regra que certifica que o elemento é um número
     */
    isNumber(message?: string) {
        this.exists();

        this.rules.push(
            (data: any) => {
                if (typeof data !== "number")
                    throw new ValidationError(message || "Tipo de dado inválido; esperado: number, recebido: " + typeof data);
                return data;
            }
        )
        return this;
    }
    
    /**
     * Regra que certifica que o elemento é um array. Também permite certificar que todos os elementos são de um certo tipo de dado. 
     */
    isArray(type: 'string' | 'number' | 'object' | 'any', message?: { array: string, items: string } ) {
        this.exists();

        this.rules.push(
            (data: any) => {

                const overrideMessage = message ? message : { array: null, items: null };
                // Certifica que é um array
                if (!Array.isArray(data))
                    throw new ValidationError(overrideMessage.array || "Tipo de dado inválido; esperado: array, recebido: " + typeof data);
                // Certifica os tipos dos elementos
                if (type && type !== 'any') 
                    for(const child of data)
                        if (typeof child !== type)
                            throw new ValidationError(overrideMessage.items || "Elementos inválidos do array; esperado: " + type + ", recebido: " + typeof child);
                
                return data;
            }
        )
        return this;
    }

    /**
     * Regra que certifica que o elemento é um objeto.
     */
    isObject(message?: string) {
        this.exists();

        this.rules.push(
            (data: any) => {

                if (!(data instanceof Object) || Array.isArray(data) || data !== null) {
                    throw new ValidationError(message || `Dado inválido (esperado: objeto, recebido: ${typeof data}`);
                }
                return data;
            }
        )
        return this;
    }
    
    /**
     * Regra que certifica que um elemento (array ou string) possui um tamanho mínimo
     */
    min(min: number, message?: string) {
        this.rules.push(
            (data: any) => {
                const size = data.length ? data.length : -1;
                    
                if (size < min) 
                    throw new ValidationError(message || "O tamanho mínimo é " + min);
            
                
                return data;
            }
        )
        return this;
    }

    /**
     * Regra que certifica que um elemento (array ou string) possui um tamanho máximo
     */
    max(max: number, message?: string) {
        this.rules.push(
            (data: any) => {
                const size = data.length ? data.length : -1;
                    
                if (size > max) 
                    throw new ValidationError(message || "Tamanho máximo atingido");
            
                
                return data;
            }
        )
        return this;
    }

    /**
     * Regra que certifica se elemento possui certa propriedade. 
     */
    hasProperty(...properties: Array<Array<string> | string>) {
        this.rules.push(
            (data: any) => {
                for (const prop of properties) {
                    // Aplica lógica de um "or" caso seja um array
                    if (Array.isArray(prop)) {
                        const hasProp = prop.filter(property => data[property] !== undefined);
                        if (!hasProp)
                            throw new ValidationError(
                                `Dado inválido: o elemento não apresenta nenhuma das propriedades: ${prop.map(p => String(p))}`
                            );
                    }
                    // Checa se elemento possui propriedade
                    else {
                        if (data[prop] === undefined)
                            throw new ValidationError(
                                `Dado inválido: o elemento não apresenta propriedade: ${prop}`
                            );
                    }
                }
                return data;
            }
        )
        return this;
    }

    
    /**
     * Regra simples que checa se um elemento é um dos elementos passados como parâmetro.
     */
    isEqualTo(values: Array<any>, message?: string) {
        this.rules.push(
            (data: any) => {
                if (!values.includes(data))
                    throw new ValidationError(message || `Dado inválido`);
                
                return data;
            }
        );
        return this;
    }

    /**
     * Regra simples que checa se um elemento não é um dos elementos passados como parâmetro.
     */
    isDifferentFrom(values: Array<any>, message?: string) {
        this.rules.push(
            (data: any) => {
                if (values.includes(data))
                    throw new ValidationError(message || `Dado inválido`);
                
                return data;
            }
        );
        return this;
    }
    /*
    c => c.areItemsValid(c => c.is)
    
    */
}


type IRule = (data: any, options?: any) => string | number | Array<any> | Object | null | boolean;

interface IValidatorInput {
    [name: string]: {
        data?: any,
        rules:  ((checker: ElementValidator) => ElementValidator),
        optional?: boolean
    }
}

type IValidatedOutput<T> = Promise<{
    [name in keyof T]: any
}>
/**
 * Função que valida os campos passados como parâmetro. Caso ocorra alguma incongruência, o erro ValidationError é ativado. É possível criar campos customizados, mas em caso de erro, é necessário ativar um ValidationError também.
 */
// Func<T>(input: IInput & T): IOutput<T>
export async function validateFields <T>(data: IValidatorInput & T): IValidatedOutput<T> {
    const errors: any = {};
    const response: any  = {};

    // Aplica função em todos os campos
    for (const field in data) {
        const info = data[field];
        let value = info.data !== undefined ? info.data : null;
        let optional = info.optional !== undefined ? info.optional : false;
        
        // Checa se campo é opcional
        if (optional)
            if (value === null)
                continue;

        let rules = info.rules(new ElementValidator()).rules;
        // Array o array de regras
        for (const rule of rules) {
            try {
                // Aplica a regra
                value = rule(value);

                // Espera a resposta caso seja uma Promise e armazena resposta
                if (value instanceof Promise) 
                    value = await value;
                
                    
            } catch (err) {
                // Armazena os erros
                if (err.name === ValidationError.name)
                    errors[field] = err.message;
                // Caso seja um erro desconhecido, ativa-o
                else
                    throw err;
                
                // Avança para próximo campo
                break;
            }
        }
        // Armazena os valores
        response[field] = value;

    }

    // Ativa os erros caso existam
    if (Object.keys(errors).length) 
        throw new ValidationError(errors);
    
    // Retorna as respostas validadas
    return response;
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


/**
 * Classe base para validators
 */
export class BaseValidator {

    /**
     * Permite enviar erro
     */
    RaiseError(data: any, code?: number) {
        throw new ValidationError(data, code);
    }

    // Autenticação necessária
    async authRequire(request: APIRequest) {
        const token = request.headers.authorization;
        const valid_error_names = ['TokenExpiredError', "JsonWebTokenError", "Error"];

        try {
            const user = await auth_user({ token, raiseError: true});
            if (user)
                return user;
        }
        catch(err) {
            if (valid_error_names.includes(err.name))
                this.RaiseError({ [err.name]: err.message });

            throw err;
        }
    }
}