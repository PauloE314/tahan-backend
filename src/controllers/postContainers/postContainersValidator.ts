import { getRepository } from "typeorm";
import { BaseValidator, validateFields, ValidationError } from "src/utils/baseValidator";

import { Users } from "@models/User";
import { Containers } from "@models/Posts/Containers";
import { Posts } from "@models/Posts/Posts";

import config, { codes } from "@config/index";



interface ICreatePostContainerInput {
    name: any,
    posts: any,
    user: Users
}
type ICreatePostContainerOutput = Promise<{
    name: string,
    posts: Array<Posts>,
    user: Users
}>

interface IUpdatePostContainerInput {
    name: any,
    posts: any,
    user: Users,
    container: Containers,
}
type IUpdatePostContainerOutput = Promise<{
    name: string,
    posts: Array<Posts>,
    user: Users
}>
/**
 * Validador de containers de posts.
 */
export class PostContainersValidator extends BaseValidator {
    rules = {
        minNameSize: config.postContainers.minNameSize
    }

    /**
     * Checa se um usuário é o autor do container
     */
    isContainerAuthor ({ user, container }: { user: Users, container: Containers }) {

        if (container.author.id !== user.id)
            this.RaiseError("Permissão negada", codes.PERMISSION_DENIED);
        
        return {
            user,
            container 
        }
    }

    /**
     * Valida a criação de um container para posts
     */
    async createValidation ({ name, posts, user }: ICreatePostContainerInput): ICreatePostContainerOutput {
        const { minNameSize } = this.rules;

        const response = await validateFields({
            name: {
                data: name,
                rules: c => c.isString().min(minNameSize).custom(validateName(user))
            },
            posts: {
                data: posts,
                rules: c => c.isArray("number").custom(validatePostList(user))
            }
        });

        return {
            name: response.name,
            posts: response.posts,
            user
        }
    }

    /**
     * Valida o update de um container para posts
     */
    async updateValidation ({ name, container, posts, user }: IUpdatePostContainerInput): IUpdatePostContainerOutput {
        const { minNameSize } = this.rules;
        const currentContainerName = container.name;

        const response = await validateFields({
            name: {
                data: name,
                rules: c => c.isString().min(minNameSize).custom(validateName(user, currentContainerName)),
                optional: true
            },
            posts: {
                data: posts,
                rules: c => c.isArray("number").custom(validatePostList(user)),
                optional: true
            }
        });

        return {
            name: response.name,
            posts: response.posts,
            user
        }
    }
}

/**
 * Certifica que uma lista de ids de postagens é válida
 */
function validatePostList(user: Users) {
    return async function (posts: Array<number>) {

        const allUserPosts = await getRepository(Posts).find({
            where: { author: { id: user.id } }
        });
        
        const postList = allUserPosts.filter(post => posts.includes(post.id));

        // Checa se todos os posts existem
        if (postList.length !== posts.length)
            throw new ValidationError("Envie uma lista válida de posts");


        return postList;
    }
}

/**
 * Valida o nome de um container para postagens
 */
function validateName(user: Users, currentName?: string) {
    return async function (name: string) {
        // Valida unicidade
        const sameNameContainer = await getRepository(Containers).findOne({
            where: { author: { id: user.id }, name }
        });
        if (sameNameContainer)
            if (sameNameContainer.name !== currentName)
                throw new ValidationError("Você já utilizou esse nome em seus containers");

        return name;
    }
}