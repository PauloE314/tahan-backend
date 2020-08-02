import { Repository, QueryBuilder, getCustomRepository, SelectQueryBuilder } from "typeorm";
import { Users } from "@models/User";
import { APIRequest } from "src/@types";
import { Response, NextFunction, Router } from "express";


interface IPaginatedData<T> {
    page: {
        current: number,
        total: number
    },
    count: number,
    found: number,
    data: Array<T>
}

type IMiddleware = (request: APIRequest, response: Response, next: NextFunction) => any;


/**
 * Modelo base de repositório da aplicação
 */
export class BaseRepository<T> extends Repository<T> {
    filter: (queryBuilder: SelectQueryBuilder<T>, params: any) => SelectQueryBuilder<T>
    paginate: (queryBuilder: SelectQueryBuilder<T>, params: any) => Promise<IPaginatedData<T>>
    filterAndPaginate: (queryBuilder: SelectQueryBuilder<T>, params: any) => Promise<IPaginatedData<T>>
}


/**
 * Modelo de rotas
 */

export class Routes {
    router: Router;

    constructor(options) {
        this.router = Router(options);
    }

    get(url: string, ...middlewares: Array<IMiddleware>) {
        const middleware_list = middlewares.length > 1 ? middlewares.splice(1, middlewares.length) : [];
        const handler = middlewares[middlewares.length - 1];

        const final_method: IMiddleware = (request, response, next) => handler(request, response, next);
        const methods = [...middleware_list, final_method];
        this.router.get(url, methods[0]);
    }

    post(url: string, ...middlewares: Array<IMiddleware>) {
        const middleware_list = middlewares.length > 1 ? middlewares.splice(1, middlewares.length) : [];
        const handler = middlewares[middlewares.length - 1];

        const final_method: IMiddleware = (request, response, next) => handler(request, response, next);
        const methods = [...middleware_list, final_method];
        this.router.post(url, methods[0]);
    }

    put(url: string, ...middlewares: Array<IMiddleware>) {
        const middleware_list = middlewares.length > 1 ? middlewares.splice(1, middlewares.length) : [];
        const handler = middlewares[middlewares.length - 1];

        const final_method: IMiddleware = (request, response, next) => handler(request, response, next);
        const methods = [...middleware_list, final_method];
        this.router.put(url, methods[0]);
    }

    delete(url: string, ...middlewares: Array<IMiddleware>) {
        const middleware_list = middlewares.length > 1 ? middlewares.splice(1, middlewares.length) : [];
        const handler = middlewares[middlewares.length - 1];

        const final_method: IMiddleware = (request, response, next) => handler(request, response, next);
        const methods = [...middleware_list, final_method];
        this.router.delete(url, methods[0]);
    }
}