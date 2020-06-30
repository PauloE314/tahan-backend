import { APIRequest } from "./global";
import { Response, NextFunction, Router, RouterOptions } from "express";
import { Server } from "socket.io";

// Classe de seeds
export class Seed {
    public async execute(){

    }
}

// Classe de validator
export class Validator {
    private errors: any;
    // public FieldValidator: FieldValidatorType;
    private fieldValidators : FieldValidator[];

    // Configurações iniciais do validator
    constructor() {
        this.clear();
    }

    public clear() {
        this.errors = {};
        this.fieldValidators = [];
    }

    // Cria um validator de campo e já o registra
    public async createFieldValidator(
        input: {
                name: string,
                data: any,
                validation: (data: any, options?: any) => void | string | Promise<void> | Promise<string>,
                options?: any
            }
        ) : Promise<FieldValidator> {
        // Cria o validator
        const newFieldValidator = new FieldValidator(input.name, input.data);
        await newFieldValidator.validate(input.validation, input.options ? input.options : undefined);

        // Armazena o validator de campo
        
        this.changeFieldValidators(newFieldValidator, { append: true });
        // retorna ele
        return newFieldValidator;
    }


    // Permite publicamente a adição de campos de validação
    public changeFieldValidators(fieldValidators: FieldValidator[] | FieldValidator, options?: { append: boolean }) {
        const append = options? options.append : false;
    
        // Caso haja opções e for pra dar append, anexa os dados ao final do array
        if (append) {
            if (Array.isArray(fieldValidators)) 
                return this.fieldValidators = fieldValidators.concat(fieldValidators);
            else 
                return this.fieldValidators.push(fieldValidators);
        }

        // Armazena o array passado como parâmetro
        this.fieldValidators = Array.isArray(fieldValidators) ? fieldValidators : [fieldValidators];
        return;
    }


    // Checa se existe algum erro de validação, se existir, retorna esses erros, se não, passa para o próximo middleware
    public answer(request: APIRequest, response: Response, next: NextFunction) {
        // Percorre a lista de campos de validação
        this.fieldValidators.forEach (validator => {
            // Armazana os inválidos
            if (!validator.isValid)
                this.errors[validator.fieldName] =  validator.message;
        })

        console.log("Inválidos:", this.errors);
        // // Caso o "tamanho do objeto" seja maior que 0, retorna erro
        if (Object.keys(this.errors).length !== 0)
            return response.status(400).send({message: this.errors});

        // // Caso não, retorna dados inválidos
        return next();
    }
}

// Validator de campo
export class FieldValidator {
    private isFieldValid: boolean = true;
    private errorMessage?: string;
    private field_name : string;

    public data: any;

    // Armazena o nome e o dado do campo
    constructor(field_name: string,data: any,) {
        this.field_name = field_name;
        this.data = data ? data : null;
    } 


    public async validate(
        callback: (data: any, options?: any) => string | void | Promise<string> | Promise<void>,
        options: any
    ) {
        const optional = options ? options.optional : false;
        // Executa a validação de campo
        const cb_response = options ? callback(this.data, options) : callback(this.data);
        // Pega a "resposta"
        const resp = cb_response instanceof Promise ? await cb_response : cb_response;

        // Caso essa validação tenha retornado um erro, seta o validator como inválido
        if (resp) {
            if (optional && this.data == null)
                return;

            this.isFieldValid = false;
            this.errorMessage = resp;
        }
    }

    // getters
    get isValid() {
        return this.isFieldValid;
    }

    get message() {
        return this.errorMessage;
    }

    get fieldName() {
        return this.field_name;
    }
}

export class SocketRouter {
    public namespaces: Array<{
        namespace: string,
        event: string,
        action: (data: any) => any
    }>

    constructor() {
        this.namespaces = []
    }

    on(namespace: string, event: string, action: (data: any) => any) {
        this.namespaces.push({ namespace, event, action })
    }

    concat(subRouter: SocketRouter) {
        subRouter.namespaces.forEach(path => {
            this.namespaces.push(path);
        });
    }

    applie(socket: Server) {
        this.namespaces.forEach(path => {
            socket.of(path.namespace).on(path.event, path.action);
        })
    }
}