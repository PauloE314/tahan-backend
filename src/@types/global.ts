import { Request, Response, NextFunction } from 'express';
import { Repository, getRepository, EntitySchema, ObjectLiteral } from 'typeorm';
import { Users } from '@models/User';
import { Sections } from '@models/Sections';
import { Topics } from '@models/Topics';
import { PlainObjectToNewEntityTransformer } from 'typeorm/query-builder/transformer/PlainObjectToNewEntityTransformer';
import { Quizzes } from '@models/quiz/Quizzes';

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
    topic?: Topics,
    quiz?: Quizzes
}


// Modelo de SOCKET
interface CLientSocket extends SocketIO.Client {
    data: user_interface
}
// Modelo cliente
export interface APISocket extends SocketIO.Socket{
    client: CLientSocket
}





