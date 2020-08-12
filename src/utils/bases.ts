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
        operator?: 'equal' | 'like' | 'is'
        data: any,
        name?: string,
        getFromEntity?: boolean,
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

        const connectors = {
            equal: '=',
            like: 'like',
            is: 'is'
        }
        // Seta a entidade
        const entity = queryBuilder.alias;
    
        for(const fieldName in params) {
            const data = params[fieldName];
            const getFromEntity = data.getFromEntity !== undefined? data.getFromEntity: true;
            const name = data.name || fieldName;
            const connector = connectors[data.operator]

            if (data.data !== undefined) {
                // Primeiro lado da equação
                const firstEqualSide = getFromEntity ? `${entity}.${fieldName}`: `${fieldName}`;

                const validData = connector === 'like' ? `%${data.data}%`: data.data;

                queryBuilder.andWhere(`${firstEqualSide} ${connector} :${name}`, { [name]: validData });
            }
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
     * Aplica a paginação e o filtro em seleções no banco de dados
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

