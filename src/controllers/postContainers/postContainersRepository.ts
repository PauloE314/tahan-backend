import { BaseRepository } from "src/utils/bases";
import { Containers } from "@models/Posts/Containers";
import { EntityRepository } from "typeorm";
import { Users } from "@models/User";
import { Posts } from "@models/Posts/Posts";


interface ICreatePostContainerInput {
    name: string,
    user: Users,
    posts: Array<Posts>
}
interface IUpdatePostContainerInput {
    container: Containers,
    name?: string,
    posts?: Array<Posts>
}
/**
 * Repositório dos containers de posts da aplicação.
 */
@EntityRepository(Containers)
export class PostContainersRepository extends BaseRepository<Containers> {

    /**
     * Listagem de containers para postagens
     */
    async listPostContainer({ params }: { params: any }) {
        // Listagem de containers
        const containersQueryBuilder = this.createQueryBuilder('container')
            .leftJoin('container.posts', 'posts')
            .leftJoin('container.author', 'author')
            .select([
                'container',
                'author.id', 'author.username',
                'posts.id', 'posts.title', 'posts.academic_level'
            ])

        return await this.filterAndPaginate(containersQueryBuilder, params);
    }

    /**
     * Cria um novo container
     */
    async createPostContainer({ user, posts, name }: ICreatePostContainerInput) {
        // Cria o container
        const container = new Containers();
        container.author = user;
        container.posts = posts;
        container.name = name;
        
        return await this.save(container);
    }

    /**
     * Atualiza o container para posts
     */
    async updatePostContainer({ name, posts, container }: IUpdatePostContainerInput) {
        // Atualiza o nome do container
        if (name)
            container.name = name;

        // Muda as postagens do container
        if (posts)
            container.posts = posts;

        return await this.save(container);
    }
}