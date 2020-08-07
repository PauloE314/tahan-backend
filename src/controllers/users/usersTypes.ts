import { google_data, APIRoute } from "src/@types";
import { Users } from "@models/User";
import { BaseRepository, IPaginatedData } from "src/utils/bases";
import { Posts } from "@models/Posts/Posts";
import { Containers } from "@models/Posts/Containers";
import { Quizzes } from "@models/quiz/Quizzes";



export interface IUsersRepository extends BaseRepository<Users> {
    createOrUpdate(data: google_data, occupation: string): Promise<Users>;
    createLoginToken(id: number, secret_key: string, expireTime: any): string;
    findUsers(params: any): Promise<IPaginatedData<Users>>;
    findPosts(authorId: any, params: any): Promise<IPaginatedData<Posts>>;
    findPostContainers(authorId: any, params: any): Promise<IPaginatedData<Containers>>;
    findQuizzes(authorId: any, params: any): Promise<IPaginatedData<Quizzes>>;
    deleteUser(user: Users): Promise<void>
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
    }>,
    getUser: (id: any) => Promise<Users>
}

type IOccupation = 'teacher' | 'student';
