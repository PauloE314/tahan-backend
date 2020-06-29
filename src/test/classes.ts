import { APIRequest } from "src/@types/global";
import { Response, NextFunction, Request } from "express";



export class Validator {
    private errors: any;
    // public FieldValidator: FieldValidatorType;
    private fieldValidators : FieldValidator[];

    // Configurações iniciais do validator
    constructor() {
        this.errors = {};
        this.fieldValidators = [];

    }

    // Checa se existe algum erro de validação, se existir, retorna esses erros, se não, passa para o próximo middleware
    public answer(request: APIRequest, response: Response, next: NextFunction) {
        // Percorre a lista de campos de validação
        this.fieldValidators.forEach (validator => {
            // Armazana os inválidos
            if (!validator.isValid)
                this.errors[validator.fieldName] =  validator.message;
        })
        // Caso o "tamanho do objeto" seja maior que 0, retorna erro
        if (Object.keys(this.errors).length !== 0)
            return response.status(400).send({message: this.errors});

        // Caso não, retorna dados inválidos
        return next();
    }


    // Cria um validator de campo e já o registra
    public async createFieldValidator(fieldName: string, data: any, callback: (data: any) => void | string | Promise<void> | Promise<string>) : Promise<FieldValidator> {
        // Cria o validator
        const newFieldValidator = new FieldValidator(fieldName, data);
        // Executa a validação de campo
        const cb_response = callback(data);
        const resp = cb_response instanceof Promise ? await cb_response : cb_response;
        // Caso essa validação tenha retornado um erro, seta o validator como inválido
        if (resp) {
            newFieldValidator.setInvalid(resp);
        }
        // Armazena o validator de campo
        this.changeFieldValidators(newFieldValidator, { append: true });
        // retorna ele
        return newFieldValidator;
    }


    // Permite publicamente a adição de campos de validação
    public changeFieldValidators(fieldValidators: FieldValidator[] | FieldValidator, options?: { append: boolean }) {
        if (options)
            // Caso haja opções e for pra dar append, anexa os dados ao final do array
            if (options.append) {
                if (Array.isArray(fieldValidators))
                    this.fieldValidators.concat(fieldValidators);
                else
                    this.fieldValidators.push(fieldValidators);
            }

        // Armazena o array passado como parâmetro
        this.fieldValidators = Array.isArray(fieldValidators) ? fieldValidators : [fieldValidators];
        return;
    }

}




export class FieldValidator {
    private isFieldValid: boolean = true;
    private errorMessage?: string;
    private field_name : string;

    public data: any;

    // Armazena o nome e o dado do campo
    constructor(field_name: string, data: any) {
        this.field_name = field_name;
        this.data = data;   
    } 

    // Permite setar o campo como inválido
    setInvalid(message: string) {
        this.isFieldValid = false;
        this.errorMessage = message;
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


