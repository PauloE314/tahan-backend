import { IPostsRepository } from "./postsTypes";
import { BaseRepository, IFilterAndPaginateInput } from "src/utils/bases";
import { Posts } from "@models/Posts/Posts";
import { EntityRepository } from "typeorm";

/**
 * Repositório dos posts da aplicação.
 */
@EntityRepository(Posts)
export class PostsRepository extends BaseRepository<Posts> implements IPostsRepository {

    /**
     * Listagem de postagens
     */
    async findPosts(params: any) {
        const postsQueryBuilder = this.createQueryBuilder('posts')
            .leftJoinAndSelect('posts.author', 'author');

        // Input da função de paginação e filtro
        const filterPaginateInput: IFilterAndPaginateInput = {
            count: params.count,
            page: params.page,
            filter: {
                title: { like: params.title },
                topic: { equal: params.topic },
            }
        };

        // Procura pelo id de um autor ou por seu username
        if (params.author_id)
            filterPaginateInput.filter['author.id'] = { equal: params.author_id, getFromEntity: false };

        else if (params.author)
            filterPaginateInput.filter['author.username'] = { like: params.author, getFromEntity: false };
            
        // Aplica filtro e paginação
        const serializedPostList = await this.filterAndPaginate(postsQueryBuilder, filterPaginateInput);

        return serializedPostList;
    }

}
