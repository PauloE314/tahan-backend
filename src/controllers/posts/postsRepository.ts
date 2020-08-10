import { IPostsRepository, IUpdateValidatedData, IUpdateRepoData, ICreateRepoData } from "./postsTypes";
import { BaseRepository, IFilterAndPaginateInput } from "src/utils/bases";
import { Posts } from "@models/Posts/Posts";
import { EntityRepository, getRepository } from "typeorm";
import { Users } from "@models/User";
import { ICreateValidatedData } from './postsTypes'
import { Contents } from "@models/Posts/Contents";
import { Likes } from "@models/Posts/Likes";

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
            .leftJoin('post.comments', 'comment')
            .select([
                'post',
                'topic',
                'comment',
                'content',
                'author.id', 'author.username', 'author.image_url'
            ])
            .getOne();

        // Checa se o usuário deu like
        const userLiked = user ? (await getRepository(Likes).findOne({
            where: { user: user.id}
        })) : false;

        
        //@ts-ignore
        post.likes = { count: <number>post.likes, user_liked: userLiked ? true : false };

        return post;
    }

    /**
     * Criação de postagens.
     */
    async createPosts({ author, title, contents, academic_level, description }: ICreateRepoData) {
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

        const saved = await this.save(post);
        delete saved.author;
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
        delete saved.author;
        return saved;
    }

    /**
     * Permite dar like em uma postagem
     */
    async like(user: Users, post: Posts) {
        // Tenta pegar o like anterior
        const original_like = await getRepository(Likes).createQueryBuilder('like')
            .leftJoin('like.user', 'user')
            .leftJoin('like.post', 'post')
            .where('user.id = :userId', { userId: user.id })
            .where('post.id = :postId', { postId: post.id })
            .getOne();

        // Caso ele não existe, cria um novo
        if (!original_like) {
            const like = new Likes();
            like.post = post;
            like.user = user;
            // Salva o like
            const saved = await getRepository(Likes).save(like);
            return saved
        }
        // Caso exista, apaga o like
        else {
            await getRepository(Likes).remove(original_like);
            return false;
        }
    
    }

}
