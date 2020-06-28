import { Request, Response } from 'express';
import { Repository, getRepository, EntitySchema, ObjectLiteral } from 'typeorm';
import { Users } from '@models/User';
import { Sections } from '@models/Sections';
import { Topics } from '@models/Topics';

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
export interface FieldValidator {
    isValid: boolean,
    message?: string,
}


// Classe de seeds
export class Seed {
    public async execute(){

    }
}

