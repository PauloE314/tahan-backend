import { Repository, QueryBuilder, getCustomRepository, SelectQueryBuilder } from "typeorm";
import { Users } from "@models/User";
import { APIRequest } from "src/@types";
import { Response, NextFunction, Router } from "express";
import configs from '@config/server';


export interface IPaginatedData<T> {
    page: {
        current: number,
        total: number
    },
    count: number,
    found: number,
    data: Array<T>
}

interface IFilterInput {
    [name: string]: {
        like?: any,
        equal?: any,
        name?: string
    }
}

interface IPaginateInput {
    page?: any,
    count?: any
}

export interface IFilterAndPaginateInput extends IPaginateInput  {
    filter: IFilterInput
}

/**
 * Modelo base de repositório da aplicação
 */
export class BaseRepository<T> extends Repository<T> {
    /**
     * Filtra os dados de um selectQueryBuilder
     */
    filter <new_T>(queryBuilder: SelectQueryBuilder<new_T>, params: IFilterInput): SelectQueryBuilder<new_T> {
        // Seta a entidade
        const entity = queryBuilder.alias;
    
        for(const fieldName in params) {
            const data = params[fieldName];
            const name = data.name || fieldName;
            // Aplica like
            if (data.like) 
                queryBuilder.andWhere(`${entity}.${fieldName} LIKE :${name}`, { [name]: `%${data.like}%`});
            
            // Aplica igual
            else if (data.equal !== undefined)
                queryBuilder.andWhere(`${entity}.${fieldName} = :${name}`, { [name]: data.equal });
    
        }
        return queryBuilder;
    }

    /**
     * Aplica a paginação nos dados de um selectQueryBuilder.
     */
    async paginate<new_T>(queryBuilder: SelectQueryBuilder<new_T>, params: IPaginateInput): Promise<IPaginatedData<new_T>> {
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

    /**
     * Aplica a paginação e o filtro
     */
    async filterAndPaginate <new_T>(queryBuilder: SelectQueryBuilder<new_T>, params: IFilterAndPaginateInput): Promise<IPaginatedData<new_T>> {
        // Separa os parâmetros
        const { filter, ...paginationParams } = params;
        // Aplica filtro
        const filtered = this.filter(queryBuilder, filter);

        // Aplica paginação
        const paginated = await this.paginate(filtered, paginationParams);
        // Retorna dados formatados
        return paginated;
    }

}

