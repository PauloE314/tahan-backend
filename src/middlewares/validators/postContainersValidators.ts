import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";
import { getRepository } from "typeorm";

import { Validator, is_array, is_number, is_string } from "src/utils/validators";

import { Posts } from '@models/Posts/Posts';
import { Users } from "@models/User";
import { Containers } from "@models/Posts/Containers";
import { SafeMethod } from "src/utils";

/**
 * Validator de containers para posts
 */
export default class PostContainersValidator {
    /**
     * **Validação de criação de container para posts**
     * 
     * post-container/ - POST
     */
    @SafeMethod
    async create_validation (request: APIRequest, response: Response, next: NextFunction) {
        const user = request.user.info;
        const { name, posts } = request.body;
        const validator = new Validator();

        // Valida o nome do container
        await validator.validate({ name }, [is_string, name_validation], { user });
        
        // Valida lista de postagens
        await validator.validate({ posts }, [is_array, post_validation], { user, request });

        // Retorna a resposta
        return validator.resolve(request, response, next);        
    }  
    
    /**
     * **Validação de update de container para posts.**
     * 
     * post-container/:number/ - PUT
     */
    @SafeMethod
    async update_validation (request: APIRequest, response: Response, next: NextFunction) {
        const container = request.container;
        const user = request.user.info;
        const { name, add, remove } = request.body;
        const validator = new Validator();

        // Validação de usuário
        const user_validation = await validator.validate({ user }, [is_container_owner], { container });

        if (!user_validation.is_valid)
            return validator.resolve(request, response, next, 401);

        // Validação de nome
        await validator.validate({ name }, [is_string, name_validation], { user, optional: true });

        // Validação de adicionados
        await validator.validate(
            { add },
            [is_array, post_validation, add_validation],
            { optional: true, container, user, request }
        );

        // Validação de removidos
        await validator.validate(
            { remove },
            [is_array, remove_validation],
            { optional: true, container, user }
        );

        return validator.resolve(request, response, next);
    }

    /**
     * **Validação de delete de container para posts.**
     * 
     * post-container/:number/ - DELETE
     */
    @SafeMethod
    async delete_validation (request: APIRequest, response: Response, next: NextFunction) {
        const user = request.user.info;
        const container = request.container;
        const validator = new Validator();
        // Validação de user
        await validator.validate({ user }, [is_container_owner], { container });

        return validator.resolve(request, response, next, 401);
    }
}



/**
 * Função que checa a validade dos nomes dos containers
 */
async function name_validation(data: string, options: any) {
    const user: Users = options.user;
    // Valida tamanho
    if (data.length < 3) {
        return "Envie um nome de no mínimo 3 caracteres";
    }

    // Valida unicidade
    const same_container = await getRepository(Containers).findOne({
        where: { author: { id: user.id }, name: data }
    });
    if (same_container)
        return "Você já utilizou esse nome em seus containers";

    return;
}

/**
 * Função que checa se os posts realmente existem
 */
async function post_validation(data: Array<number>, options: any) {
    const user: Users = options.user;
    const request: APIRequest = options.request;
    // Pega todos os posts do usuário
    const all_posts = await getRepository(Posts).find({
        where: { author: { id: user.id } }
    });

    const filtered_posts = all_posts.filter(post => data.includes(post.id));
    // Checa se todos os posts existem
    if (filtered_posts.length !== data.length)
        return "Envie uma lista válida de posts"
    
    if (request)
        request.post_list = filtered_posts;
    return;
}

/**
 * Função que checa se o usuário é o dono de um container ou não
 */
async function is_container_owner(data: Users, options: { container: Containers }) {
    if (data.id !== options.container.author.id) 
        return "O usuário não é autorizado a realizar essa ação";
    return;
}


/**
 * Função que valida posts adicionados
 */
async function add_validation(data: Array<number>, options: { container: Containers }) {
    // Lista de posts do container
    const post_list = options.container.posts.map(post => post.id);
    for (const id of data) {
        if(post_list.includes(id))
            return `O post ${id} já está presente no container`;
    }
    return;
}


/**
 * Função que valida posts adicionados
 */
async function remove_validation(data: Array<number>, options: { container: Containers }) {
    // Lista de posts do container

    const post_list = options.container.posts.map(post => post.id);
    for (const id of data) {
        if(!post_list.includes(id))
            return `O post ${id} não está presente no container`;
    }
    return;
}