import { IUpdateValidatedData, IUpdateRepoData, ICreateRepoData, ICommentRepoData } from "./postsTypes";
import { BaseRepository, IFilterAndPaginateInput } from "src/utils/bases";
import { Posts } from "@models/Posts/Posts";
import { EntityRepository, getRepository } from "typeorm";
import { Contents } from "@models/Posts/Contents";
import { Comments } from "@models/Posts/Comments";
import { Users } from "@models/User";

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
            .select([
                'post',
                'post.like_amount',
                'topic',
                'author.id', 'author.username',
            ])

        // Aplica ordenação por likes
        if (order === 'likes')
            postsQueryBuilder.orderBy('post.like_amount', 'DESC');

            
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
            
        const { likes, like_amount, ...postData } = post;

 
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




@EntityRepository(Comments)
export class PostCommentRepository extends BaseRepository<Comments> {
    /**
     * Retorna a lista de comentários de uma postagem
     */
    async listPostComments(data: { postId: number }) {
        const { postId } = data;

        const commentQueryBuilder = getRepository(Comments).createQueryBuilder('comment')
            .leftJoin('comment.post', 'post')
            .leftJoin('comment.author', 'author')
            .where('post.id = :postId', { postId })
            .loadRelationIdAndMap('comment.reference', 'comment.reference')
            .select([
                'comment',
                'author.id', 'author.username', 'author.image_url',
            ])

        const comments = await commentQueryBuilder.getMany();

        return comments;
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

    /**
     * Apaga comentário
     */
    async deleteComment(postComment: Comments) {
        await this.remove(postComment);
    }
}