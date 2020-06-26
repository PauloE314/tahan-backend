import { Request, Response } from 'express';
import { Repository, getRepository, EntitySchema, ObjectLiteral } from 'typeorm';
import { Users } from '@models/User'

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
    user?: user_interface
}


// Classe de seeds
export class Seed {
    public async execute(){

    }
}
