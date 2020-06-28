import { Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

import { APIRequest } from "src/@types/global";
import configs from '@config/server';
import { Users } from '@models/User';
import { getRepository } from "typeorm";


interface jwt_decoded {
    id: number;
    iat: number;
    exp: number;
}


export async function get_user(request: APIRequest, response: Response, next: NextFunction) {
    const { secret_key } = configs;
    const auth_header = request.headers.authorization;
    const splited_header = auth_header ? auth_header.split(' ') : []

    if (splited_header.length == 2 && splited_header[0] == "Bearer") {
        const token = splited_header[1];

        try {
            // Checa se o token está válido
            const user_jwt_data = (<jwt_decoded>jwt.verify(token, secret_key));
            const userRepo = getRepository(Users);
            const user = await userRepo.findOne({id: user_jwt_data.id})

            if (user) {
                request.user = {
                    info: user,
                    date: {
                        expires: String(new Date(user_jwt_data.exp *1000)),
                        starts: String(new Date(user_jwt_data.iat *1000))
                    }
                }
            }
        }
        catch(err) {
            console.log({auth: err.message});
        }
    }
    return next();
}


// Checa se usuário está logado e retorna suas informações
export async function auth_require(request: APIRequest, response: Response, next: NextFunction){
    
    const { secret_key } = configs;
    const auth_header = request.headers.authorization;
    // Checa se existe um header de autenticação
    
    if (!auth_header)
        return response.status(401).send({message: 'O usuário não apresenta autenticação - headers'});

    const splited_auth_header = auth_header.split(' ');
    // Checa se ele está bem formatado
    if (splited_auth_header.length != 2 || splited_auth_header[0] != "Bearer")
        return response.status(401).send({message: 'Header malformatado - uso: "Bearer <token>"'});
            

        const token = splited_auth_header[1];

        // Checa se o token está válido
        try{
            const id = (<jwt_decoded>jwt.verify(token, secret_key)).id;
            // retorna o dado
            const userRepo = getRepository(Users);
            const user = await userRepo.findOne({id})

            if (!user)
                return response.status(401).send({message:  "Usuário não existente"})


            return next();
        }
        catch(err) {
            if (err.name == "TokenExpiredError")
                return response.status(401).send({message: "Token expirou ou não existe"})

            if (err.name == "JsonWebTokenError")
                return response.status(400).send({message: "Erro no token JWt", original_message: err.message})
            return response.status(500).send({error: { name: err.name, message: err.message }})
        }
    }
