import { BaseRepository, IFilterAndPaginateInput } from "src/utils/bases";
import { Posts } from "@models/Posts/Posts";
import { EntityRepository, getRepository } from "typeorm";
import { TContentType, Contents } from "@models/Posts/Contents";
import { Users } from "@models/User";
import { Topics } from "@models/Topics";


interface ICreatePostInput {
    title: string,
    contents: Array<{ type: TContentType, data: string, position?: number }>,
    academic_level: 'médio' | 'fundamental' | 'superior',
    topic: Topics,
    description: string,
    author: Users
}

interface IUpdatePostInput {
    title?: string,
    add?: Array<{ type: TContentType, data: string, position?: number }>,
    remove?: Array<number>,
    positions?: Array<{ id: number, position: number }>,
    academic_level?: 'médio' | 'fundamental' | 'superior',
    description?: any,
    post: Posts
}

/**
 * Repositório dos posts da aplicação.
 */
@EntityRepository(Posts)
export class PostsRepository extends BaseRepository<Posts> {

    /**
     * Listagem de postagens
     */
    async findPosts(params: any) {
        const order = params.order || null;

        const postsQueryBuilder = this.createQueryBuilder('post')
            .leftJoin('post.author', 'author')
            .leftJoin('post.topic', 'topic')
            .leftJoin('post.likes', 'likes')
            .loadRelationCountAndMap('post.likes', 'post.likes')
            .select([
                'post',
                'topic',
                'author.id', 'author.username',
            ])
            


        // Aplica ordenação por likes
        if (order === 'relevance')
            postsQueryBuilder
                .addSelect(`
                    CASE
                        WHEN post_likes.postsId IS NOT NULL THEN COUNT(post.id)
                        ELSE 0
                    END`,
                    'likes_count'
                )
                .groupBy('post.id')
                .orderBy('likes_count', 'DESC');

            
        // Input da função de paginação e filtro
        const filterPaginateInput: IFilterAndPaginateInput = {
            count: params.count,
            page: params.page,
            filter: {
                title: { operator: 'like', data: params.title },
                topic: { operator: 'equal', data: params.topic },
            }
        };
        
        // Procura pelo id de um autor ou por seu username
        if (params.author_id)
            filterPaginateInput.filter['author.id'] = {
                operator: 'equal',
                data: params.author_id,
                getFromEntity: false
            };
        
        else if (params.author)
            filterPaginateInput.filter['author.username'] = {
                operator: 'like',
                data: params.author,
                getFromEntity: false
            };
        
        
        // Aplica filtro e paginação
        const serializedPostList = await this.filterAndPaginate(postsQueryBuilder, filterPaginateInput);
        
        return serializedPostList;
    }
    
    /**
     * Tenta pegar um quiz individualmente e lidar com comentários, likes, etc.
     */
    async getFullPost({ id, user }: { id: number, params: any, user: Users }) {

        const post = await getRepository(Posts).createQueryBuilder("post")
            .where("post.id = :id", { id })
            .leftJoin('post.author', 'author')
            .loadRelationCountAndMap('post.likes', 'post.likes')
            .leftJoinAndSelect('post.topic', 'topic')
            .leftJoinAndSelect('post.contents', 'content')
            .select([
                'post',
                'topic',
                'content',
                'author.id', 'author.username', 'author.image_url'
            ])
            .getOne();
            
        const { likes, ...postData } = post;

 
        // Checa se o usuário deu like
        const userLiked = await this.userLikedPost(user.id, post.id);

        return {
            ...postData,
            likes: {
                count: <any>likes,
                user_liked: userLiked ? true : false
            },
        };
    }

    /**
     * Criação de postagens.
     */
    async createPosts({ author, title, contents, academic_level, description, topic }: ICreatePostInput) {
        const post = new Posts();
        post.author = author;
        post.title = title;
        post.contents = contents.map(content => {
            const newContent = new Contents();
            newContent.data = content.data;
            newContent.type = content.type;
            newContent.position = content.position || -1;
            return newContent;
        });
        post.academic_level = academic_level;
        post.description = description;
        post.topic = topic;


        const saved = await this.save(post);
        return saved;
    }

    /**
     * Atualização de postagem
     */
    async updatePost({ post, title, description, academic_level, add, remove, positions }: IUpdatePostInput) {
        post.title = title || post.title;
        post.description = description || post.description;
        post.academic_level = academic_level || post.academic_level;


        // Seta as posições dos conteúdos
        if (positions) {
            // Resolve promises
            Promise.all(post.contents.map(async content => {
                const contentPosition = positions.find(p => p.id === content.id);
                // Atualiza a posição
                if (contentPosition) {
                    content.position = contentPosition.position;
                    await getRepository(Contents).save(content);
                }
                
                return content;
            }));
        }

        // Adiciona novos conteúdos
        if (add) {
            const newContents = add.map(content => {
                console.log(content.type)
                const newContent = new Contents();
                newContent.data = content.data;
                newContent.type = content.type;
                newContent.position = content.position || -1;
                return newContent;
            })
            post.contents = [...post.contents, ...newContents];
        }
        // Remove conteúdos
        if (remove) {
            const remainContentList: Array<Contents> = [];
            const removeContentList: Array<Contents> = [];

            for (const content of post.contents) {
                if (remove.includes(content.id))
                    removeContentList.push(content);

                else
                   remainContentList.push(content); 
            }

            post.contents = remainContentList;
            await getRepository(Contents).remove(removeContentList);
        }

        // Salva a postagem
        const saved = await this.save(post);
        return saved;
    }

    /**
     * Checa se um like existe
     */
    async userLikedPost(userId: number, postId: number) {
        
        const post = await this.createQueryBuilder('post')
            .leftJoinAndSelect('post.likes', 'userLike')
            .where('post.id = :postId', { postId })
            .andWhere('userLike.id = :userId', { userId })
            .getOne();

        if (post)
            return post;

        return false;
    }
}



