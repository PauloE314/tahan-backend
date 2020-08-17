import { BaseValidator, validateFields } from "src/utils/validators";
import { Users } from "@models/User";
import { Comments } from "@models/Posts/Comments";
import { codes } from "@config/server";
import { getRepository } from "typeorm";
import { ValidationError } from "src/utils";

export class PostCommentValidator extends BaseValidator {

    /**
     * Valida os dados de criação de um comentário de posts
     */
    async comment({ text, reference }: { text: any, reference: any }) {
        
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
            reference: response.reference ? <Comments>response.reference : undefined
        };
    }

    /**
     * Certifica que o usuário é o autor de um comentário
     */
    isPostCommentAuthor(data: { user: Users, postComment: Comments }) {
        const { user, postComment } = data;

        if (postComment.author.id !== user.id)
            this.RaiseError("Essa rota só é válida para o autor do comentário", codes.PERMISSION_DENIED);

        return postComment;
    }

    /**
     * Certifica que comentário existe
     */
    async postCommentExists({ id }: { id: number }) {
        const quizCommentRepo = getRepository(Comments);

        const comment = quizCommentRepo.findOne({
            relations: ['author'],
            where: { id }
        });

        if (!comment)
            this.RaiseError("Comentário não encontrado", codes.NOT_FOUND);

        return comment;
    }
}


/**
 * Checa se um comentário existe
 */
async function validateCommentReference(id: number) {
    const comment = await getRepository(Comments).findOne(id);

    if (!comment)
        throw new ValidationError("Referência inválida");

    return comment;
}