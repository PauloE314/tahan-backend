import { IPostsRepository, IUpdateValidatedData, IUpdateRepoData, ICreateRepoData, ICommentRepoData } from "./postsTypes";
import { BaseRepository, IFilterAndPaginateInput } from "src/utils/bases";
import { Posts } from "@models/Posts/Posts";
import { EntityRepository, getRepository } from "typeorm";
import { Contents } from "@models/Posts/Contents";
import { Likes } from "@models/Posts/Likes";
import { Comments } from "@models/Posts/Comments";

/**
 * Repositório dos posts da aplicação.
 */
@EntityRepository(Posts)
export class PostsRepository extends BaseRepository<Posts> implements IPostsRepository {

    /**
     * Listagem de postagens
     */
    async findPosts(params: any) {
        const postsQueryBuilder = this.createQueryBuilder('post')
            .leftJoin('post.author', 'author')
            .leftJoin('post.topic', 'topic')
            .loadRelationCountAndMap('post.likes', 'post.likes')
            .select([
                'post',
                'topic',
                'author.id', 'author.username',
            ])

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
    async getFullPost({ id, params, user }) {

        const post = await getRepository(Posts).createQueryBuilder("post")
            .where("post.id = :id", { id })
            .leftJoin('post.author', 'author')
            .leftJoinAndSelect('post.topic', 'topic')
            .leftJoinAndSelect('post.contents', 'content')
            .loadRelationCountAndMap('post.likes', 'post.likes')
            .select([
                'post',
                'topic',
                'content',
                'author.id', 'author.username', 'author.image_url'
            ])
            .getOne();

        const { likes, comments, ...postData } = post;
        
        // Carrega comentários
        const commentQueryBuilder = getRepository(Comments)
            .createQueryBuilder('comment')
            .leftJoin('comment.post', 'post')
            .leftJoin('comment.author', 'author')
            .where('post.id = :id', { id: post.id })
            .select(['comment', 'author.id', 'author.username', 'author.image_url'])

        // Aplica paginação em comentários
        const paginatedComments = await this.paginate(commentQueryBuilder, {
            count: params.count,
            page: params.page
        });

        // Checa se o usuário deu like
        const userLiked = user ? (await getRepository(Likes).findOne({
            where: { user: user.id, post: post.id }
        })) : false;

        

        return {
            ...postData,
            likes: {
                count: <any>post.likes,
                user_liked: userLiked ? true : false
            },
            comments: paginatedComments,
        };
    }

    /**
     * Criação de postagens.
     */
    async createPosts({ author, title, contents, academic_level, description, topic }: ICreateRepoData) {
        const post = new Posts();
        post.author = author;
        post.title = title;
        post.contents = contents.map(content => {
            const newContent = new Contents();
            newContent.data = content.data;
            newContent.type = content.type;
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
    async updatePost({ post, title, description, academic_level, contents }: IUpdateRepoData) {
        post.title = title || post.title;
        post.description = description || post.description;
        post.academic_level = academic_level || post.academic_level;

        // Adiciona novos conteúdos
        if (contents.add) {
            const newContents = contents.add.map(content => {
                const newContent = new Contents();
                newContent.data = content.data;
                newContent.type = content.type;
                return newContent;
            })
            post.contents = [...post.contents, ...newContents];
        }
        // Remove conteúdos
        if (contents.remove) {
            const remainContentList: Array<Contents> = [];
            const removeContentList: Array<Contents> = [];

            for (const content of post.contents) {
                if (contents.remove.includes(content.id))
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
        
        const like = await getRepository(Likes).createQueryBuilder('like')
            .leftJoinAndSelect('like.user', 'user')
            .leftJoinAndSelect('like.post', 'post')
            .where('user.id = :userId', { userId })
            .andWhere('post.id = :postId', { postId })
            .getOne();


        if (like)
            return like;

        return false;
    }


    /**
     * Escreve o comentário de um usuário
     */
    async writeComment({ author, post, text, reference }: ICommentRepoData) {
        const commentary = new Comments();

        commentary.author = author;
        commentary.post = post;
        commentary.text = text;

        if (reference)
            commentary.reference = reference;

        const saved = await getRepository(Comments).save(commentary);

        return saved;
    }

}
