import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";

import { Posts } from '@models/Posts/Posts';
import { getRepository } from "typeorm";
import { Users } from "@models/User";
import { Validator, is_string, is_array, is_number } from "src/utils/validators";
import { Comments } from "@models/Posts/Comments";
import { Contents } from "@models/Posts/Contents";
import { SafeMethod } from "src/utils";
import { Topics } from "@models/Topics";
import { request } from "http";



/**
 * Controlador de validação para ações das rotas dos posts.
 */
export default class PostValidator {

    /**
     * **Valida a criação do post**
     * 
     * topics/:number/posts/ - POST
     */
    @SafeMethod
    public async create_validation (request: APIRequest, response: Response, next: NextFunction) {
        const { title, contents, academic_level, description, topic } = request.body;
        const user = request.user.info;
        const validator = new Validator();

        // Validação de usuário
        const user_validation = await validator.validate({ user }, [validate_user]);

        if (!user_validation.is_valid)
            return validator.resolve(request, response, next);

        // Validação de título
        await validator.validate({ title }, [is_string, validate_title]);

        // Validação de descrição
        await validator.validate({ description }, [is_string]);

        // Validação de conteúdo
        await validator.validate({ contents }, [is_array, validate_add_contents]);

        // Validação de nível de dificuldade
        await validator.validate({ academic_level }, [is_string, validate_academic_level]);

        // Validação de tópico
        await validator.validate({ topic }, [is_number, validate_topic], { request });

        // Resposta
        return validator.resolve(request, response, next);
    }

    /**
     * **Validação de update de posts.**
     * 
     * topics/:number/posts/:number/ - PUT
     */
    @SafeMethod
    public async update_validation (request: APIRequest, response: Response, next: NextFunction) {
        const { title, add, remove, academic_level, description } = request.body;
        const { post } = request;
        const user = request.user.info;
        const validator = new Validator();

        // Validação de usuário
        const user_validation = await validator.validate({ user }, [validate_user], { post, isAuthor: true});

        // Validação de usuário
        if (!user_validation.is_valid)
            return validator.resolve(request, response, next);
        
        // Validação de título
        await validator.validate(
            { title },
            [is_string, validate_title],
            { optional: true, existent_postId: post.id }
        );
        // Validação de novos conteúdos
        await validator.validate({ add }, [is_array, validate_add_contents], { optional: true, post });

        // Validação de conteúdos a serem retirados
        await validator.validate({ remove }, [is_array, validate_remove_contents], { optional: true, post });

        // Validação de nível de dificuldade
        await validator.validate({ academic_level }, [validate_academic_level], { optional: true });

        // Validação de descrição
        await validator.validate({ description }, [is_string], { optional: true });

        // Resposta
        return validator.resolve(request, response, next);
    }

    /**
     * **Validação de delete de posts.**
     * 
     * topics/:number/posts/:number/ - DELETE
     */
    @SafeMethod
    public async delete_validation (request: APIRequest, response: Response, next: NextFunction) {
        const user = request.user.info;
        const post = request.post;
        const validator = new Validator();
        
        // Validação de usuário
        await validator.validate({ user }, [validate_user], { post, isAuthor: true });

        // Resposta
        return validator.resolve(request, response, next, 401);
    }
    
    /**
     * **Validação dos comentários dos posts.**
     * 
     * topics/:number/posts/:number/comment - POST
     */
    @SafeMethod
    public async comment_validation(request: APIRequest, response: Response, next: NextFunction) {
        const { text, reference } = request.body;
        const validator = new Validator();
        
        const text_validator = await validator.validate({ text }, [is_string])
        // Certifica que o texto é válido
        if (!text_validator.is_valid)
            return validator.resolve(request, response, next);

        // Se houver uma resposta, certifica que referencia um comentário que existe
        await validator.validate({ reference }, [is_number, validate_comment], { optional: true });

        return validator.resolve(request, response, next);
    }
}



// Validators de campos
/**
 * Valida o título do post 
 */
async function validate_title (title: string, options?: { optional: boolean, existent_postId?: number }) {
    // Valida o tamanho do título
    if (title.length > 5) {
        const same_title_post = await getRepository(Posts).findOne({ title });
        const existent_postId = options ? options.existent_postId : null;
        // Checa se o título já não existe
        if (same_title_post) 
            if (same_title_post.id !== existent_postId)
                return "Esse título já foi escolhido para outro tópico";

    }
    else 
        return "Envie um título válido - maior que 5 caracteres";

    return;
}


/**
 * Valida o nível acadêmico
 */
async function validate_academic_level (academic_level: string) {
    const levels = ['fundamental', 'médio', 'superior'];

    if (!levels.includes(academic_level))
        return "Envie um nível acadêmico aceitável";
}

/**
 * Validação de tópico 
 */
async function validate_topic (data: number, options?: { request: APIRequest }) {
    // Tenta pegar o tópico
    const topic = await getRepository(Topics).findOne({ where: { id: data }});
    // Retorna o erro
    if (!topic)
        return "Tópico inválido";

    options.request.topic = topic; 
}

/**
 * Valida o usuário
 */
async function validate_user (user: Users, options?: { post: Posts, isAuthor: boolean }) {
    let response: string;
    if (user.occupation !== "teacher") 
        response ="O usuário não pode criar um post. É necessário ser um professor para tal";

    if (options) 
        if (options.isAuthor) {
            const post_author_id = (await getRepository(Posts).findOne({
                relations: ["author"],
                where: { id: options.post.id }
            })).author.id;

            if (post_author_id !== user.id) 
                response = "O usuário não tem permissão para essa ação; apenas o autor possui";
        }

    return response;
}

/**
 * Valida a criação dos conteúdos de um post
 */
async function validate_add_contents(data: Array<{ subtitle: string, text: string }>, options?: any) {
    for (const content of data) {
        const subtitle = content.subtitle;
        const text = content.text;

        // Certifica que o objeto tem as propriedades corretas
        if (!subtitle || !text) {
            return "Conteúdo inválido";
        }
    }
}
     
/**
 * Valida a remoção de conteúdos
 */
async function validate_remove_contents (data: any, options: { post: Posts }) {
    const { post } = options;
    // Pega a lista de ids dos conteúdos
    const content_ids = post.contents.map(content => content.id);
    // Certifica que o conteúdo pertence ao post
    for (const content of data) {
        // Certifica que o conteúdo a ser removido pertence ao post
        const content_exist = content_ids.find(id => id == content);
        if (!content_exist) 
            return "Conteúdo inexistente não pode ser apagado";
    }
}

/**
 * Valida os comentários
 */
async function validate_comment (data: number) {
    const referenced_comment = await getRepository(Comments).findOne({ id: data });
    if (!referenced_comment) 
        return 'Envie uma referência válida';
    
}