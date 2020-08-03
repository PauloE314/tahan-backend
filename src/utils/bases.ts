import { Repository, QueryBuilder, getCustomRepository, SelectQueryBuilder } from "typeorm";
import { Users } from "@models/User";
import { APIRequest } from "src/@types";
import { Response, NextFunction, Router } from "express";
import configs from '@config/server';


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
    filter: <new_T>(queryBuilder: SelectQueryBuilder<new_T>, params: any) => SelectQueryBuilder<new_T>
    paginate: <new_T>(queryBuilder: SelectQueryBuilder<new_T>, params: any) => Promise<IPaginatedData<new_T>>

    /**
     * Filtra a aplica paginação nos dados de um selectQueryBuilder.
     */
    async filterAndPaginate<new_T>(queryBuilder: SelectQueryBuilder<new_T>, params: any): Promise<IPaginatedData<new_T>> {
        // Dados de entrada
        const request_page = Number(params.page);
        const request_count = Number(params.count);
        // Limpa dados
        const page = Math.max((!isNaN(request_page) ? request_page : 1), 1);
        const count = Math.max((!isNaN(request_count) ? request_count : configs.default_pagination), 1);
        // Aplica paginação
        queryBuilder
            .skip((page - 1) * count)
            .take(count)
        // Pega os dados
        const [data, found] = await queryBuilder.getManyAndCount();
            
        return {
            page: {
                current: page,
                total: Math.ceil(found / count)
            },
            count,
            found,
            data
        }

    }
}

