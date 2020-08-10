import { IPostsValidator, ICreateData, IUpdateData } from "./postsTypes";
import { getRepository, Check } from "typeorm";
import { Posts } from "@models/Posts/Posts";
import { BaseValidator, validateFields } from "src/utils/validators";
import configs from 'src/config/server';
import { type } from "os";
import { ValidationError } from "src/utils";
import { Topics } from "@models/Topics";
import { Users } from "@models/User";

/**
 * Validador dos posts.
 */
export class PostsValidator extends BaseValidator implements IPostsValidator {

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
        const contentList = post.contents.map(content => content.id);

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
                rules: check => check.isArray("object").custom(validateContents),
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
     * Certifica que o usuário é o autor da postagem
     */
    isPostAuthor(post: Posts, user: Users) {
        if (post.author.id !== user.id) 
            throw new ValidationError("Essa rota só é válida para o autor da postagem");
    }
}


/**
 * Função que valida um conteúdo
 */
function validateContents(data: Array<any>) {
    const validTypes = ['title', 'subtitle', 'topic', 'paragraph'];

    for (const item of data) {
        if (!validTypes.includes(item.type))
            throw new ValidationError("Tipo de conteúdo inválido (os tipos aceitos são: title, subtitle, topic, paragraph)");

        if (typeof item.data !== 'string')
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