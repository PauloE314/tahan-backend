import { Request, Response, NextFunction } from 'express';
import { APIRequest } from 'src/@types';
import { ValidationError } from 'src/utils';



/**
 * Método que centraliza os erros da aplicação
 */
export default function errorHandler(error: Error, request: Request, response: Response, next: NextFunction) {
    if (error.name === ValidationError.name) 
        return response.status((<ValidationError>error).code).send({
            message: error.message
        })
    

    return response.status(500).send({
        errors: {
            name: error.name,
            message: error.message
        }
    })
}