import { Request, NextFunction, Response } from 'express';
import { Users } from '@models/User';
import { Topics } from '@models/Topics';
import { Posts } from '@models/Posts/Posts';
import { Quizzes } from '@models/quiz/Quizzes';
import { Containers } from '@models/Posts/Containers';
import { Friendships } from '@models/friends/Friendships';
import { Solicitations } from '@models/friends/Solicitations';
import { Comments } from '@models/Posts/Comments';

// modelo de usuário
export interface user_interface {
    info: Users;
    date: {
        expires: string;
        starts: string;
    }
}

// Dados retornados pelo google
export interface google_data {
    email: string,
    id: string,
    name: string,
    image_url: string
}

// Modelo de Request
export interface APIRequest extends Request{
    user?: user_interface,
    google_data?: google_data,
    topic?: Topics,
    post?: Posts,
    container?: Containers,
    quiz?: Quizzes,
    friendship?: Friendships,
    solicitation?: Solicitations,
    postComment?: Comments
}

export type IApiResponse = (request: APIRequest, response: Response, next?: NextFunction) => Response | Promise<Response>



