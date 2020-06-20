import {Request, Response} from 'express';

// modelo ed usuário
export interface user_interface {
    id: number,
    username: string,
    email: string
}


export interface APIRequest extends Request{
    user?: user_interface
}