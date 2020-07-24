import { Response, NextFunction } from "express";
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { google_data } from "src/@types"

import { APIRequest, user_interface } from "src/@types";
import configs from '@config/server';
import { Users } from '@models/User';
import { getRepository } from "typeorm";
import { Quizzes } from "@models/quiz/Quizzes";
import { Questions } from "@models/quiz/Questions";
import { print } from "util";


interface jwt_decoded {
    id: number;
    iat: number;
    exp: number;
}


/**
 * Autentica um usuário
 */
export async function auth_user(input: { token: string, raiseError: boolean, bearer?: boolean}) : Promise<user_interface | void> {
    const { bearer, raiseError, token } = input;

    const { secret_key } = configs;
    // Checa se existe um header de autenticação
    if (!token)
        if (raiseError)
            throw new Error('O usuário não apresenta autenticação - headers');
        else
            return;

    // Checa formatação do Bearer token
    if (bearer !== false) {
        const splited_header = token.split(' ');
        // Checa se ele está bem formatado
        if (splited_header.length != 2 || splited_header[0] != "Bearer")
            throw new Error('Header malformatado - uso: "Bearer <token>"');
    }

    const jwt_token = bearer !== false ? token.split(' ')[1] : token;

    // Checa se o token está válido
    try{
        const user_jwt_data = (<jwt_decoded>jwt.verify(jwt_token, secret_key));
        // retorna o dado
        const userRepo = getRepository(Users);
        const user = await userRepo.findOne(user_jwt_data.id);
        
        // Caso o usuário exista, retorna seus dados
        if (user)
            return {
                info: user,
                date: {
                    expires: String(new Date(user_jwt_data.exp *1000)),
                    starts: String(new Date(user_jwt_data.iat *1000))
                }
            }
        // Caso não, retorna erro
        throw new Error('O usuário não existe mais')
    }
    // Lida com as exceptions do código
    catch(err) {
        if (!raiseError)
            return;

        if (err.name == "TokenExpiredError")
            err.message = "Token expirou";

        if (err.name == "JsonWebTokenError") {
            err.message = "Erro no token JWt - inválido";
        }

        throw err;
    }
}


/**
 * Pega as informações do usuário dado um access token. Caso o toke de acesso seja inválido, retorna null ou erro
 */
export async function get_google_user_data(access_token: string, options?: { raise: boolean }) : Promise<google_data|null>{
    const raise_error = options? options.raise : false;
    const url = "https://www.googleapis.com/plus/v1/people/me?access_token=";
    try {
        // Pega os dados do usuário
        const { data } = await axios.get(url + access_token);
        console.log(data)
        const email = data.emails[0].value;
        const { id, displayName, image } = data;
        // Retorna os dados escolhidos
        return {
            email, id, displayName, image_url: image.url
        };
    }
    // Caso token seja inválido, retorna null ou erro
    catch(err) {
        if (raise_error)
            throw err;
        
        return null;
    }
}

interface GetQuizResponse {
    returning_question: Questions,
    question: Questions
}
    

// Executa um método um dado número de vezes
export async function count_runner ( data: { times: number, execute?: (counter: number, stopTimmer: () => void) => any, on_time_over?: () => any }) {
    let counter = data.times;
    const execute = data.execute ? data.execute : () => {};
    const on_time_over = data.on_time_over ? data.on_time_over : () => {};
    // Cria o contador
    const timmer = setInterval(() => {
        // Caso o contador acabe
        if (counter == 0) {
            stopTimmer();
            on_time_over();
        }

        execute(counter, stopTimmer);

        counter--;
    }, 1000);
    // Função de parar a contagem
    const stopTimmer = () => clearInterval(timmer);
}

// Gera uma string aleatória
export function get_random_value(length: number, list?: Array<string>) {
    let result = '';
    const value_list = list || [];
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    if (value_list.includes(result))
        return get_random_value(length, value_list);
    
    return result;
}

export function random_array(array: Array<any>) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;   
}