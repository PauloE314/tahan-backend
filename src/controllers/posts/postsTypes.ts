import { IApiResponse } from "src/@types";
import { IPaginatedData, BaseRepository } from "src/utils/bases";
import { Posts } from "@models/Posts/Posts";
import { Users } from "@models/User";
import { TContentType, Contents } from "@models/Posts/Contents";
import { Comments } from "@models/Posts/Comments";
import { Topics } from "@models/Topics";



// Interfaces de leitura
export interface IFullPostData{
    id: number,
    topic: Topics,
    author: Users,
    title: string,
    description: string,
    contents: Contents[],
    likes: {
        count: number,
        user_liked: boolean
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
    topic: Topics,
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