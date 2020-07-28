import { Request, Response, NextFunction } from 'express';
import { APIRequest } from 'src/@types';



/**
 * Método que centraliza os erros da aplicação
 */
export default function errorHandler(error: Error, request: Request, response: Response, next: NextFunction) {
    return response.send({
        errors: {
            name: error.name,
            message: error.message
        }
    })
}