import {Request, Response} from 'express';

// modelo de usuário
export interface user_interface {
    id: number,
    username: string,
    email: string
}

// Modelo de Request
export interface APIRequest extends Request{
    user?: user_interface
}
