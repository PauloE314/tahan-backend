import { google_data, IApiResponse } from "src/@types";
import { Users } from "@models/User";
import { BaseRepository, IPaginatedData } from "src/utils/bases";
import { Posts } from "@models/Posts/Posts";
import { Containers } from "@models/Posts/Containers";
import { Quizzes } from "@models/quiz/Quizzes";
import { BaseValidator } from "src/utils/validators";



/**
 * Validador de ações do controlador de usuários.
 */
export interface IUsersValidator extends BaseValidator {
    signIn: (access_token: any, occupation: any) => Promise<{
        google_data: google_data,
        occupation: IOccupation
    }>,
    getUser: (id: any) => Promise<Users>,
    isTeacher: (target: Users) => Users
}

type IOccupation = 'teacher' | 'student';
