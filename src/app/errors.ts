import { Request, Response, NextFunction } from 'express';


export default function errorHandler(error: Error, request: Request, response: Response, next: NextFunction) {
    return response.send({
        error: {
            name: error.name,
            message: error.message
        }
    })
}