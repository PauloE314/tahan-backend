import { Request, Response, NextFunction } from 'express';
import { Repository, getRepository, EntitySchema, ObjectLiteral } from 'typeorm';
import { Users } from '@models/User';
import { Sections } from '@models/Sections';
import { Topics } from '@models/Topics';
import { PlainObjectToNewEntityTransformer } from 'typeorm/query-builder/transformer/PlainObjectToNewEntityTransformer';

// modelo de usuário
export interface user_interface {
    info: Users;
    date: {
        expires: string;
        starts: string;
    }

}

// Modelo de Request
export interface APIRequest extends Request{
    user?: user_interface,
    section?: Sections,
    topic?: Topics
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


export class Validator {

    handle_errors_or_next(errors: object, request: APIRequest, response: Response, next: NextFunction) {
        if (Object.keys(errors).length !== 0)
            return response.status(400).send(errors);

        return next();
    }
}


// Classe de seeds
export class Seed {
    public async execute(){

    }
}

