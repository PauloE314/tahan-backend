import { APIRequest } from "src/@types/global";
import { Response, NextFunction, Request } from "express";


export class Validator {
    private errors: any;

    constructor() {
        this.errors = {};
    }

    public answer(request: APIRequest, response: Response,next: NextFunction) {
        if (Object.keys(this.errors).length !== 0)
            return response.status(400).send({message: this.errors});

        return next();
    }

    public setError(name: string, message: string) {
        this.errors[name] = message;
    }

    public checkFields(field_validators: NewFieldValidator[]) {
        field_validators.forEach (fieldValidator => {
            if (!fieldValidator.isValid)
                this.errors[fieldValidator.fieldName] = fieldValidator.message;
        })
    }
}


export class NewFieldValidator {
    private isFieldValid: boolean = true;
    private data: any;
    private errorMessage?: string;
    private field_name : string

    constructor(field_name: string, data: any) {
        this.field_name = field_name;
        this.data = data;
   
    } 

    setInvalid(message: string) {
        this.isFieldValid = false;
        this.errorMessage = message;
    }

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


