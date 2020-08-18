import { APIRequest } from "../@types";
import { authUser } from ".";
import { codes } from "@config/index";



/**
 * Erro de validação
 */
export class ValidationError extends Error {
    name = 'ValidationError';
    code = codes.BAD_REQUEST;
    message: any;

    constructor(message: any, code?: number) {
        super();
        this.message = message;
        if (code)
            this.code = code;
    }
}

/**
 * Validador de elementos. Permite validar campos de forma dinâmica.
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
     * Verifica se é um array e itera sobre cada elemento
     */
    isArrayAndIterate(cb: IRule, message?: string) {
        this.rules.push(
            async (data: any) => {
                // Certifica que é um array
                if (!Array.isArray(data))
                    throw new ValidationError(message || "Tipo de dado inválido, esperado: array, recebido " + typeof data);

                const responses: Array<any> = [];

                for (const element of data) {
                    let response = cb(element);

                    if (response instanceof Promise)
                        response = await response;


                    responses.push(response);
                }
                return responses;
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

type IRule = (data: any, options?: any) => string | number | Array<any> | Object | null | boolean;
/**
 * Função que valida os campos passados como parâmetro. Caso ocorra alguma incongruência, o erro ValidationError é ativado. É possível criar campos customizados, mas em caso de erro, é necessário ativar um ValidationError também.
 */
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
 * Classe base para validators
 */
export class BaseValidator {

    /**
     * Permite enviar erro
     */
    RaiseError(data: any, code?: number) {
        throw new ValidationError(data, code);
    }

    /**
     * Método que obriga a validação de autenticação
     */
    async authRequire(request: APIRequest) {
        const token = request.headers.authorization;
        const valid_error_names = ['TokenExpiredError', "JsonWebTokenError", "Error"];

        try {
            const user = await authUser({ token, raiseError: true});
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