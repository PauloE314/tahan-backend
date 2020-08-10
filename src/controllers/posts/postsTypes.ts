import { IApiResponse } from "src/@types";
import { IPaginatedData } from "src/utils/bases";
import { Posts } from "@models/Posts/Posts";
import { Users } from "@models/User";

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
export interface IPostsRepository {
    findPosts: (params: any) => Promise<IPaginatedData<Posts>>,
    // createPosts: (author: Users, ...data: any) => Promise<Posts>,
    // getPost: (id: number) => Promise<Posts>,
    // updatePost: (post: Posts | number, ...data: any) => Promise<Posts>,
    // deletePost: (post: Posts | number) => Promise<void>,
    // like: (user: Users) => Promise<void>,
    // comment: (user: Users, ...data: any) => Promise<Posts>
}

/**
 * Interface do validador de ações em posts.
 */
export interface IPostsValidator {
    // create: (title: any, contents: any, academic_level: any, description: any) => Promise<ICreateValidatedData>,
    // update: (title?: any, contents?: any, academic_level?: any, description?: any) => Promise<IUpdateValidatedData>,
    // comment: (author: Users, text: any, post: any, reference: any) => Promise<ICommentValidatedData>
}


// Interfaces auxiliares
interface ICreateValidatedData {
    title: string,
    contents: any,
    academic_level: 'médio' | 'fundamental' | 'superior',
    description: any,
}

interface IUpdateValidatedData {
    title?: string,
    contents?: any,
    academic_level?: 'médio' | 'fundamental' | 'superior',
    description?: any,
}

interface ICommentValidatedData {
    text: string,
    post: Posts,
    author: Users,
    reference: Posts
}