import { google_data, IApiResponse } from "src/@types";
import { Users } from "@models/User";
import { BaseRepository, IPaginatedData } from "src/utils/bases";
import { Posts } from "@models/Posts/Posts";
import { Containers } from "@models/Posts/Containers";
import { Quizzes } from "@models/quiz/Quizzes";

/**
 * Interface do controlador de rotas dos usuários da aplicação.
 */
export interface IUsersController {
    signIn: IApiResponse,
    refresh: IApiResponse,
    read: IApiResponse,
    posts: IApiResponse,
    postContainers: IApiResponse,
    readSelf: IApiResponse,
    selfQuizzes: IApiResponse,
    selfPosts: IApiResponse,
    selfPostContainers: IApiResponse
    delete: IApiResponse
}

/**
 * Interface do repositório dos usuários.
 */
export interface IUsersRepository extends BaseRepository<Users> {
    createOrUpdate(data: google_data, occupation: string): Promise<Users>;
    createLoginToken(id: number, secret_key: string, expireTime: any): string;
    findUsers(params: any): Promise<IPaginatedData<Users>>;
    findUserPosts(authorId: any, params: any): Promise<IPaginatedData<Posts>>;
    findUserPostContainers(authorId: any, params: any): Promise<IPaginatedData<Containers>>;
    findUserQuizzes(authorId: any, params: any): Promise<IPaginatedData<Quizzes>>;
    deleteUser(user: Users): Promise<void>
}

/**
 * Validador de ações do controlador de usuários.
 */
export interface IUsersValidator {
    signIn: (access_token: any, occupation: any) => Promise<{
        google_data: google_data,
        occupation: IOccupation
    }>,
    getUser: (id: any) => Promise<Users>
}

type IOccupation = 'teacher' | 'student';
