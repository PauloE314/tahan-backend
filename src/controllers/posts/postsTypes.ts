import { IApiResponse } from "src/@types";
import { IPaginatedData, BaseRepository } from "src/utils/bases";
import { Posts } from "@models/Posts/Posts";
import { Users } from "@models/User";
import { TContentType } from "@models/Posts/Contents";

/**
 * Interface do controlador de rotas dos posts.
 */
export interface IPostsController {
    list: IApiResponse,
    create: IApiResponse,
    read: IApiResponse,
    delete: IApiResponse,
    update: IApiResponse,
    like: IApiResponse,
    comment: IApiResponse,
}

/**
 * Interface do repositório de posts.
 */
export interface IPostsRepository extends BaseRepository<Posts> {
    findPosts: (params: any) => Promise<IPaginatedData<Posts>>,
    getFullPost: (data: { id: number, params: any, user: Users }) => Promise<Posts>
    createPosts: (data: ICreateRepoData) => Promise<Posts>,
    updatePost: (data: IUpdateRepoData) => Promise<Posts>,
    like: (user: Users, post: Posts) => Promise<any>
    // deletePost: (post: Posts | number) => Promise<void>,
    // like: (user: Users) => Promise<void>,
    // comment: (user: Users, ...data: any) => Promise<Posts>
}

/**
 * Interface do validador de ações em posts.
 */
export interface IPostsValidator {
    create: (data: ICreateData) => Promise<ICreateValidatedData>,
    update: (data: IUpdateData) => Promise<IUpdateValidatedData>,
    isPostAuthor: (post: Posts, user: Users) => any
    // comment: (author: Users, text: any, post: any, reference: any) => Promise<ICommentValidatedData>
}



// Interfaces de criação
export interface ICreateData {
    title: any,
    contents: any,
    academic_level: any,
    topic: any,
    description: any,
}

export interface ICreateValidatedData {
    title: string,
    contents: Array<{ type: TContentType, data: string }>,
    academic_level: 'médio' | 'fundamental' | 'superior',
    topic: number,
    description: string,
}

export interface ICreateRepoData extends ICreateValidatedData {
    author: Users
}

// Interfaces de update
export interface IUpdateData {
    post: Posts,
    author: Users,
    title?: any,
    add?: any,
    remove?: any,
    academic_level?: any,
    description?: any
}
export interface IUpdateValidatedData {
    title?: string,
    contents?: {
        add?: Array<{ type: TContentType, data: string }>,
        remove?: Array<number>
    },
    academic_level?: 'médio' | 'fundamental' | 'superior',
    description?: any
}
export interface IUpdateRepoData extends IUpdateValidatedData {
    post: Posts
}

// Interfaces de comentário
interface ICommentValidatedData {
    text: string,
    post: Posts,
    author: Users,
    reference: Posts
}