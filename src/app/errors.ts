import { Request, Response } from 'express';


export default function errorHandler(error: Error, request: Request, response: Response) {
    return response.send({
        error: {
            name: error.name,
            message: error.message
        }
    })
}