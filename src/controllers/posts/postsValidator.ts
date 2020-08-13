import { ICreateData, IUpdateData, ICommentData, ICommentValidatedData } from "./postsTypes";
import { getRepository } from "typeorm";
import { Posts } from "@models/Posts/Posts";
import { BaseValidator, validateFields } from "src/utils/validators";
import configs, { codes } from 'src/config/server';
import { ValidationError } from "src/utils";
import { Topics } from "@models/Topics";
import { Users } from "@models/User";
import { Comments } from "@models/Posts/Comments";

/**
 * Validador dos posts.
 */
export class PostsValidator extends BaseValidator {

    /**
     * Valida os campos de criação de uma postagem
     */ 
    async create({ title, contents, academic_level, description, topic }: ICreateData) {
        const { min_title_size } = configs.posts;
        const response = await validateFields({
            title: {
                data: title,
                rules: check => check.isString().min(min_title_size)
            },
            academic_level: {
                data: academic_level,
                rules: check => check.isString().isEqualTo(
                    ['fundamental', 'médio', 'superior'],
                    'Envie um nível aceitável (fundamental, médio, superior)'
                )
            },
            contents: {
                data: contents,
                rules: check => check.isArray("object").custom(validateContents)
            },
            description: {
                data: description,
                rules: check => check.isString().min(10)
            },
            topic: {
                data: topic,
                rules: Check => Check.isNumber().custom(validateTopic)
            }
        });

        return {
            title: response.title,
            contents: response.contents,
            academic_level: response.academic_level,
            description: response.description,
            topic: response.topic,
        }
    }

    /**
     * Valida os dados de update das postagens
     */
    async update({ post, title, academic_level, add, remove, description, author }: IUpdateData) {
        const { min_title_size } = configs.posts;

        this.isPostAuthor(post, author);
        
        // Valida os campos
        const response = await validateFields({
            title: {
                data: title,
                rules: check => check.isString().min(min_title_size),
                optional: true
            },
            academic_level: {
                data: academic_level,
                rules: check => check.isString().isEqualTo(
                    ['fundamental', 'médio', 'superior'],
                    'Envie um nível aceitável (fundamental, médio, superior)'
                ),
                optional: true
            },
            add: {
                data: add,
                rules: check => check.isArray("any").custom(validateContents),
                optional: true
            },
            remove: {
                data: remove,
                rules: check => check.isArray("number")
                    .custom(() => validateRemoveContents(remove, post)),
                optional: true
            },
            description: {
                data: description,
                rules: check => check.isString().min(10),
                optional: true
            },
        });

        return {
            title: response.title,
            contents: { add: response.add, remove: response.remove },
            academic_level: response.academic_level,
            description: response.description,
        }
    }

    /**
     * Valida os dados de criação de um comentário de posts
     */
    async comment({ text, reference }: ICommentData) {
        
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
        
        return <ICommentValidatedData>{
            text: response.text,
            reference: response.reference ? response.reference : undefined
        };
    }

    /**
     * Certifica que o usuário é o autor da postagem
     */
    isPostAuthor(post: Posts, user: Users) {
        if (post.author.id !== user.id) 
            throw new ValidationError("Essa rota só é válida para o autor da postagem", codes.PERMISSION_DENIED);
    }

    /**
     * Certifica que o usuário é o autor de um comentário
     */
    isPostCommentAuthor(data: { user: Users, postComment: Comments }) {
        const { user, postComment } = data;

        if (postComment.author.id !== user.id)
            throw new ValidationError("Essa rota só é válida para o autor do comentário", codes.PERMISSION_DENIED)
    }
}


/**
 * Função que valida um conteúdo
 */
function validateContents(data: Array<any>) {
    const validTypes = ['title', 'subtitle', 'topic', 'paragraph'];

    for (const item of data) {
        const { type, data } = item;

        if (!validTypes.includes(type))
            throw new ValidationError("Tipo de conteúdo inválido (os tipos aceitos são: title, subtitle, topic, paragraph)");

        if (typeof data !== 'string')
            throw new ValidationError("Dado do conteúdo deve ser uma string");
    }
    
    return data;
}

/**
 * Função de validação de tópico
 */
async function validateTopic(data: number) {
    const topic = await getRepository(Topics).findOne(data);

    // Avisa erro caso o tópico não exista
    if (!topic)
        throw new ValidationError("Tópico inválido");

    return topic;
}


/**
 * Checa se os conteúdos a serem removidos são válidos
 */
function validateRemoveContents(remove: Array<number>, post: Posts) {
    const contentListId = post.contents.map(content => content.id);

    for (const contentId of remove) {
        if (!contentListId.includes(contentId))
            throw new ValidationError("O conteúdo não está presente na postagem");
    }
    
    return remove;
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