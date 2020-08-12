import { BaseRepository } from "src/utils/bases";
import { Containers } from "@models/Posts/Containers";
import { EntityRepository } from "typeorm";

/**
 * Repositório dos containers de posts da aplicação.
 */
@EntityRepository(Containers)
export class PostContainersRepository extends BaseRepository<Containers> {

    /**
     * Cria um novo container
     */
    async createPostContainer() {

    }

    /**
     * Atualiza o container para posts
     */
    async updatePostContainer() {
        
    }
}