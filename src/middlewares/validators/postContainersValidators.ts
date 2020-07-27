import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";
import { Validator } from "src/utils/validators";

import { Posts } from '@models/Posts/Posts';
import { getRepository } from "typeorm";
import { Users } from "@models/User";
// import { Validator } from "src/utils/classes";
import { Comments } from "@models/Posts/Comments";
import { Contents } from "@models/Posts/Contents";
import { Containers } from "@models/Posts/Containers";

/**
 * Validator de containers para posts
 */
export default class PostContainersValidator extends Validator {
    validators = {
        name_validation: { method: name_validator },
        post_validation: { method: post_validator },
        is_owner: { method: is_container_owner },
        add_validation: { method: add_validation },
        remove_validation: { method: remove_validation }
    }
    /**
     * Validação de criação de container para posts
     */
    create_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        const { user } = request;
        const { name, posts } = request.body;
        // Valida o nome do container
        const name_validation = await this.validate({
            name: 'name', data: name, methods: ['is_string', 'name_validation'], options: { user: user.info }
        });
        // Valida a lista de postagens
        const posts_validation = await this.validate({
            name: 'posts', data: posts, methods: ['is_array', 'post_validation'], options: { user: user.info, request }
        })

        // Resolve
        return this.resolve(request, response, next, [name_validation, posts_validation]);        
    }  
    /**
     * Validação de update de container para posts
     */
    update_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        const { user, container } = request;
        const { name, add, remove } = request.body;

        // Validação de usuário
        const user_validation = await this.validate({
            name: "user", data: user.info, methods: ["is_owner"], options: { container } 
        })
        if (user_validation)
            return this.resolve(request, response, next, [user_validation]);

        // Validação de nome
        const name_validation = await this.validate({
            name: 'name', data: name, methods: ['is_string', 'name_validation'], options: { user: user.info, optional: true }
        });

        // Validação de adicionados
        const add_validation = await this.validate({
            name: "add", data: add, methods: ['is_array', 'post_validation', 'add_validation'], options: { optional: true, container, user: user.info, request }
        });

        // Validação de removidos
        const remove_validation = await this.validate({
            name: "remove", data: remove, methods: ['is_array', 'remove_validation'], options: { optional: true, container, user: user.info }
        });

        return this.resolve(request, response, next, [name_validation, add_validation, remove_validation]);

    }

    /**
     * Validação de delete de container para posts
     */
    delete_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        const { user, container } = request;
        // Validação de user
        const user_validation = await this.validate({
            name: "user", data: user.info, methods: ["is_owner"], options: { container } 
        })

        return this.resolve(request, response, next, [user_validation]);
    }
}

/**
 * Função que checa a validade dos nomes dos containers
 */
async function name_validator(data: string, options: any) {
    const user: Users = options.user;
    // Valida tamanho
    if (data.length <= 3) {
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
async function post_validator(data: Array<number>, options: any) {
    const user: Users = options.user;
    const request: APIRequest = options.request;
    // Checa se existem pelo menos 1 post
    console.log(user)
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