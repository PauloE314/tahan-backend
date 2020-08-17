import { getRepository } from "typeorm";
import { Posts } from "@models/Posts/Posts";
import { BaseValidator, validateFields } from "src/utils/validators";
import configs, { codes } from 'src/config/server';
import { ValidationError } from "src/utils";
import { Topics } from "@models/Topics";
import { Users } from "@models/User";
import { Comments } from "@models/Posts/Comments";
import { TContentType } from "@models/Posts/Contents";

interface ICreatePostInput {
    title: any,
    contents: any,
    academic_level: any,
    topic: any,
    description: any,
}
interface ICreatePostOutput {
    title: string,
    contents: Array<{ type: TContentType, data: string }>,
    academic_level: 'médio' | 'fundamental' | 'superior',
    topic: Topics,
    description: string,
}

interface IUpdatePostInput {
    post: Posts,
    author: Users,
    title?: any,
    add?: any,
    remove?: any,
    academic_level?: any,
    description?: any
}

interface IUpdatePostOutput {
    title?: string,
    contents?: {
        add?: Array<{ type: TContentType, data: string }>,
        remove?: Array<number>
    },
    academic_level?: 'médio' | 'fundamental' | 'superior',
    description?: any
}
/**
 * Validador dos posts.
 */
export class PostsValidator extends BaseValidator {

    /**
     * Valida os campos de criação de uma postagem
     */ 
    async create({ title, contents, academic_level, description, topic }: ICreatePostInput) {
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

        return <ICreatePostOutput>{
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
    async update({ post, title, academic_level, add, remove, description, author }: IUpdatePostInput) {
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

        return <IUpdatePostOutput>{
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
            throw new ValidationError("Essa rota só é válida para o autor da postagem", codes.PERMISSION_DENIED);
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

