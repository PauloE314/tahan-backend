import {Request, Response} from 'express';
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
