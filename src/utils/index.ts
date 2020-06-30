import { Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

import { APIRequest, user_interface } from "src/@types/global";
import configs from '@config/server';
import { Users } from '@models/User';
import { getRepository } from "typeorm";


interface jwt_decoded {
    id: number;
    iat: number;
    exp: number;
}

export async function auth_user(input: { token: string, method: string, raiseError: boolean, bearer?: boolean}) : Promise<user_interface | void> {
    const { bearer } = input;


    async function auth_JWT (auth_header: string, _bearer: boolean) : Promise<user_interface>{
        const { secret_key } = configs;
        // Checa se existe um header de autenticação
        
        if (!auth_header)
            throw new Error('O usuário não apresenta autenticação - headers');
            if (_bearer !== false) {
                const splited_header = auth_header.split(' ');
                // Checa se ele está bem formatado
                if (splited_header.length != 2 || splited_header[0] != "Bearer")
                    throw new Error('Header malformatado - uso: "Bearer <token>"');
            }

            const token = _bearer !== false ? auth_header.split(' ')[1] : auth_header;

            // Checa se o token está válido
            try{
                const user_jwt_data = (<jwt_decoded>jwt.verify(token, secret_key));
                // retorna o dado
                const userRepo = getRepository(Users);
                const user = await userRepo.findOne(user_jwt_data.id);

                if (user)
                    return {
                        info: user,
                        date: {
                            expires: String(new Date(user_jwt_data.exp *1000)),
                            starts: String(new Date(user_jwt_data.iat *1000))
                        }
                    }

                return;
            }
            catch(err) {
                if (err.name == "TokenExpiredError")
                    err.message = "Token expirou";

                if (err.name == "JsonWebTokenError") {
                    err.message = "Erro no token JWt - inválido";
                }

                throw err;
            }
    }

    async function auth_OAuth(token: string) {

    }

    const { token, method, raiseError } = input;
    try {
        // console.log(await auth_JWT(token, bearer));

        const user = method.toLowerCase() == 'jwt' ? await auth_JWT(token, bearer) : await auth_OAuth(token);
        
    
        if (user)
            return user;
    }
    catch(err) {
        if (raiseError)
            throw err;

        return;
    }
}
