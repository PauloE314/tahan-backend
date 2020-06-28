import { APIRequest } from "./global";
import { Response, NextFunction } from "express";

// Classe de seeds
export class Seed {
    public async execute(){

    }
}


export class Validator {
    errors: any;
    constructor() {
        this.errors = {};
    }

    handle_errors_or_next(errors: object, request: APIRequest, response: Response, next: NextFunction) {
        if (Object.keys(errors).length !== 0)
            return response.status(400).send(errors);

        return next();
    }
}


// Interface de validator
export class FieldValidator {
    private isFieldValid: boolean = true;
    private errorMessage?: string;

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
}


