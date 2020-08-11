import { IApiResponse } from "src/@types";
import { IPaginatedData, BaseRepository } from "src/utils/bases";
import { Posts } from "@models/Posts/Posts";
import { Users } from "@models/User";
import { TContentType, Contents } from "@models/Posts/Contents";
import { Comments } from "@models/Posts/Comments";
import { Likes } from "@models/Posts/Likes";
import { Topics } from "@models/Topics";

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
    getFullPost: (data: { id: number, params: any, user: Users }) => Promise<IFullPostData>
    createPosts: (data: ICreateRepoData) => Promise<Posts>,
    updatePost: (data: IUpdateRepoData) => Promise<Posts>,
    userLikedPost: (userId: number, postId: number) => Promise<Likes | false>,
    writeComment: (data: ICommentRepoData) => Promise<Comments>
}

/**
 * Interface do validador de ações em posts.
 */
export interface IPostsValidator {
    create: (data: ICreateData) => Promise<ICreateValidatedData>,
    update: (data: IUpdateData) => Promise<IUpdateValidatedData>,
    comment: (data: ICommentData) => Promise<ICommentValidatedData>
    isPostAuthor: (post: Posts, user: Users) => any
}


// Interfaces de leitura
export interface IFullPostData{
    id: number,
    topic: Topics,
    author: Users,
    title: string,
    description: string,
    contents: Contents[],
    comments: IPaginatedData<Comments>,
    likes: {
        count: number,
        userLiked: boolean
    }
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
export interface ICommentData {
    text: any,
    reference?: any
}

export interface ICommentValidatedData {
    text: string,
    reference?: Comments
}

export interface ICommentRepoData extends ICommentValidatedData {
    author: Users,
    post: Posts,
}