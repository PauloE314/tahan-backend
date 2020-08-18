import { Repository, SelectQueryBuilder } from "typeorm";
import configs from '@config/index';


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
    filter <Tp>(queryBuilder: SelectQueryBuilder<Tp>, params: IFilterInput): SelectQueryBuilder<Tp> {

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
            const connector = connectors[data.operator];

            // Certifica que o dado existe
            if (data.data !== undefined) {
                
                const firstEqualSide = getFromEntity ? `${entity}.${fieldName}`: `${fieldName}`;

                const validData = connector === 'like' ? `%${data.data}%`: data.data;

                // Realiza o WHERE
                queryBuilder.andWhere(`${firstEqualSide} ${connector} :${name}`, { [name]: validData });
            }
        }
        return queryBuilder;
    }

    /**
     * Aplica a paginação nos dados de um selectQueryBuilder.
     */
    async paginate<Tp>(queryBuilder: SelectQueryBuilder<Tp>, params: IPaginateInput): Promise<IPaginatedData<Tp>> {
        // Dados de entrada
        const request_page = Number(params.page);
        const request_count = Number(params.count);
        // Limpa dados
        const page = Math.max((!isNaN(request_page) ? request_page : 1), 1);
        const count = Math.max((!isNaN(request_count) ? request_count : configs.defaultPagination), 1);
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
    async filterAndPaginate <Tp>(queryBuilder: SelectQueryBuilder<Tp>, params: IFilterAndPaginateInput): Promise<IPaginatedData<Tp>> {
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

