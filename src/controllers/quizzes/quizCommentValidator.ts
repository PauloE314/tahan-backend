import { getRepository } from "typeorm";
import { validateFields, BaseValidator, ValidationError } from "src/utils/baseValidator";

import { Users } from "@models/User";
import { QuizComments } from "@models/quiz/QuizComments";

import { codes } from "@config/index";

/**
 * Validador de comentários de quizzes
 */
export class QuizCommentsValidator extends BaseValidator {

    /**
     * Valida os dados de criação de um comentário de posts
     */
    async comment({ text, reference }: { text: string, reference: QuizComments }) {
        
        const response = await validateFields({
            text: {
                data: text,
                rules: check => check.isString()
            },
            reference: {
                data: reference,
                rules: check => check.isNumber().custom(validateCommentReference),
                optional: true
            }
        })
        
        return {
            text: <string>response.text,
            reference: response.reference ? <QuizComments> response.reference : undefined
        };
    }

    /**
     * Certifica que um usuário é o autor de um comentário
     */
    isQuizCommentAuthor({ user, quizComment }: { user: Users, quizComment: QuizComments }) {

        if (quizComment.author.id !== user.id)
            this.RaiseError(
                "Essa rota só é válida para o autor do comentário",
                codes.PERMISSION_DENIED
            );

        return quizComment;
    }

    /**
     * Certifica que um comentário de quiz existe
     */
    async quizCommentExists({ id }: { id: number }) {
        const quizCommentRepo = getRepository(QuizComments);

        // Carrega comentário
        const comment = quizCommentRepo.findOne({
            relations: ['author'],
            where: { id }
        });

        // Verifica se ele existe
        if (!comment)
            this.RaiseError("Comentário não encontrado", codes.NOT_FOUND);

        return comment;
    }
}

/**
 * Checa se um comentário existe
 */
async function validateCommentReference(id: number) {
    const comment = await getRepository(QuizComments).findOne(id);

    if (!comment)
        throw new ValidationError("Referência inválida");

    return comment;
}