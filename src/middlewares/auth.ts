import { Response, NextFunction } from "express";
import { auth_user } from 'src/utils';
import { APIRequest } from "src/@types";
import { codes } from "@config/server";


/*
 * Checa se usuário está logado e retorna suas informações
 */
export async function auth_require(request: APIRequest, response: Response, next: NextFunction) {
    const token = request.headers.authorization;
    const valid_error_names = ['TokenExpiredError', "JsonWebTokenError", "Error"];

    try {
        const user = await auth_user({ token, raiseError: true});
        if (user)
            next();
    }
    catch(err) {
        if (err.name == "TokenExpiredError")
            return response.status(406).send({message: err.message});
            
        else if (valid_error_names.includes(err.name))
            return response.status(codes.PERMISSION_DENIED).send({message: err.message});

        return response.status(codes.SERVER_ERROR).send({name: err.name, message: err.message});
    }
}


export async function is_teacher(request: APIRequest, response: Response, next: NextFunction) {
    const user = request.user.info;

    if (!(user.occupation == 'teacher')) {
        return response.status(codes.PERMISSION_DENIED).send({message: 'Permissão negada, apenas professores podem executar essa ação'});
    }

    return next();
}

export async function is_student(request: APIRequest, response: Response, next: NextFunction) {
    const user = request.user.info;

    if (!(user.occupation === "student")) {
        return response.status(codes.PERMISSION_DENIED).send({message: 'Permissão negada, apenas alunos podem executar essa ação'});
    }

    return next();
}