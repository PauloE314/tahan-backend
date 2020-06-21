import { Router, Request, Response, NextFunction } from 'express';
import { getManager } from 'typeorm';
import { User } from "../database/models/User";


const routes = Router({ mergeParams: true })

routes.get('/', async (request: Request, response: Response, next: NextFunction) => {

    const users = await getManager().find(User);

    return response.send(users);
})

export default routes;