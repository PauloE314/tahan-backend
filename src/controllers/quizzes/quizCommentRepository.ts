import { QuizComments } from "@models/quiz/QuizComments";
import { Quizzes } from "@models/quiz/Quizzes";
import { Users } from "@models/User";
import { EntityRepository } from "typeorm";
import { BaseRepository } from "src/utils/bases";

interface ICreateQuizCommentInput {
    author: Users,
    quiz: Quizzes,
    text: string,
    reference: QuizComments
}

/**
 * Repositório de comentários do quiz
 */
@EntityRepository(QuizComments)
export class QuizCommentRepository extends BaseRepository<QuizComments> {
    /**
     * Retorna a lista de comentários do quiz
     */
    async listPostComments(data: { quizId: number }) {
        const { quizId } = data;

        const commentQueryBuilder = this.createQueryBuilder('comment')
            .leftJoin('comment.quiz', 'quiz')
            .leftJoin('comment.author', 'author')
            .where('quiz.id = :quizId', { quizId })
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
    async writeComment({ author, quiz, text, reference }: ICreateQuizCommentInput) {
        const commentary = new QuizComments();

        commentary.author = author;
        commentary.quiz = quiz;
        commentary.text = text;

        if (reference)
            commentary.reference = reference;

        const saved = await this.save(commentary);

        return saved;
    }

    /**
     * Apaga comentário
     */
    async deleteComment(postComment: QuizComments) {
        await this.remove(postComment);
    }
}
