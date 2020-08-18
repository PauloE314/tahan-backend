import { Comments } from "@models/Posts/Comments";
import { getRepository, EntityRepository } from "typeorm";
import { BaseRepository } from "src/utils/bases";
import { Posts } from "@models/Posts/Posts";
import { Users } from "@models/User";


export interface ICreatePostCommentInput {
    text: string,
    reference?: Comments,
    author: Users,
    post: Posts,
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

        return await commentQueryBuilder.getMany()
    }


    /**
     * Escreve o comentário de um usuário
     */
    async writeComment({ author, post, text, reference }: ICreatePostCommentInput) {
        const commentary = new Comments();

        commentary.author = author;
        commentary.post = post;
        commentary.text = text;

        if (reference)
            commentary.reference = reference;

        return await getRepository(Comments).save(commentary)
    }

    /**
     * Apaga comentário
     */
    async deleteComment(postComment: Comments) {
        await this.remove(postComment);
    }
}