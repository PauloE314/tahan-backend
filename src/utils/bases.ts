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

