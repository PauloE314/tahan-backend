import { getRepository } from "typeorm";
import { Posts } from "@models/Posts/Posts";
import { BaseValidator, validateFields } from "src/utils/validators";
import configs, { codes } from 'src/config/server';
import { ValidationError } from "src/utils";
import { Topics } from "@models/Topics";
import { Users } from "@models/User";
import { Comments } from "@models/Posts/Comments";
import { TContentType, Contents } from "@models/Posts/Contents";

interface ICreatePostInput {
    title: any,
    contents: any,
    academic_level: any,
    topic: any,
    description: any
}
interface ICreatePostOutput {
    title: string,
    contents: Array<{ type: TContentType, data: string, position?: number }>,
    academic_level: 'médio' | 'fundamental' | 'superior',
    topic: Topics,
    description: string,
}

interface IUpdatePostInput {
    post: Posts,
    title?: any,
    add?: any,
    remove?: any,
    academic_level?: any,
    description?: any,
    positions?: number
}

interface IUpdatePostOutput {
    title?: string,
    add?: Array<{ type: TContentType, data: string, position?: number }>,
    remove?: Array<number>
    academic_level?: 'médio' | 'fundamental' | 'superior',
    description?: string,
    positions?: Array<{ id: number, position: number }>
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
                rules: check => check.isArrayAndIterate(validateContents)
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
    async update({ post, title, academic_level, add, remove, description, positions }: IUpdatePostInput) {
        const { min_title_size } = configs.posts;
        
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
                rules: check => check.isArrayAndIterate(validateContents),
                optional: true
            },
            remove: {
                data: remove,
                rules: check => check.isArrayAndIterate(validateRemoveContents(post.contents)),
                optional: true
            },
            description: {
                data: description,
                rules: check => check.isString().min(10),
                optional: true
            },
            position: {
                data: positions,
                rules: c => c.isArrayAndIterate(validateContentPosition(post.contents)),
                optional: true
            }
        });

        return <IUpdatePostOutput>{
            title: response.title,
            add: response.add,
            remove: response.remove,
            positions: response.position,
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
function validateContents(contentData: any) {
    const validTypes = ['title', 'subtitle', 'topic', 'paragraph'];

    const { type, data, position } = contentData;

    if (!validTypes.includes(type))
        throw new ValidationError("Tipo de conteúdo inválido (os tipos aceitos são: title, subtitle, topic, paragraph)");

    if (typeof data !== 'string')
        throw new ValidationError("Dado do conteúdo deve ser uma string");

    if (typeof position !== 'number')
        throw new ValidationError("A posição deve ser um número");
    
    
    return contentData;
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
function validateRemoveContents(contentList: Array<Contents>) {
    const contentListId = contentList.map(content => content.id);

    return function (removeId: any) {
        if (!contentListId.includes(Number(removeId)))
            throw new ValidationError("Remoção inválida");
        
        return removeId;
    }
}


/**
 * Valida a posição dos conteúdos
 */
function validateContentPosition(contents: Array<Contents>) {
    const contentsListId = contents.map(content => content.id);

    return function(data: any) {
        const { id, position } = data;

        // Certifica que são números
        if (typeof id !== "number" || typeof position !== "number")
            throw new ValidationError("Dados inválidos");

        // Certifica que o id existe
        if (!contentsListId.includes(id))
            throw new ValidationError("Conteúdo inexistente");

        return data;    
    }
}