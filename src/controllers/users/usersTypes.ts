import { google_data, APIRoute } from "src/@types";
import { Users } from "@models/User";



export interface IUsersRepository {
    createOrUpdate(data: google_data, occupation: string): Promise<Users>;
    createLoginToken(id: number, secret_key: string, expireTime: any): string;
}

export interface IUsersController {
    signIn: APIRoute,
    read: APIRoute,
    posts: APIRoute,
    postContainers: APIRoute,
    readSelf: APIRoute,
    selfQuizzes: APIRoute,
    selfPosts: APIRoute,
    selfPostContainers: APIRoute
    delete: APIRoute
}

export interface IUsersValidator {
    signIn: (access_token: any, occupation: any) => Promise<{
        google_data: google_data,
        occupation: IOccupation
    }>
}

type IOccupation = 'teacher' | 'student';
