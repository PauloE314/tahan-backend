import { Response, NextFunction } from "express";
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { google_data } from "src/@types"

import { APIRequest, user_interface } from "src/@types";
import configs from '@config/index';
import { Users } from '@models/User';
import { getRepository } from "typeorm";



interface jwtDecoded {
    id: number;
    iat: number;
    exp: number;
}

interface IAuthUserInput {
    token: string,
    raiseError: boolean,
    bearer?: boolean
}


/**
 * Autentica um usuário
 */
export async function authUser(input: IAuthUserInput) : Promise<user_interface | void> {
    const { bearer, raiseError, token } = input;

    const { secretKey } = configs.security;
    // Checa se existe um header de autenticação
    if (!token)
        if (raiseError)
            throw new Error('O usuário não apresenta autenticação - headers');
        else
            return;

    // Checa formatação do Bearer token
    if (bearer !== false) {
        const authHeaderList = token.split(' ');
        // Checa se ele está bem formatado
        if (authHeaderList.length != 2 || authHeaderList[0] != "Bearer")
            throw new Error('Header mal-formatado - uso: "Bearer <token>"');
    }

    const jwtToken = bearer !== false ? token.split(' ')[1] : token;

    // Checa se o token está válido
    try{
        const userJwtToken = (<jwtDecoded>jwt.verify(jwtToken, secretKey));

        // Carrega usuário
        const user = await getRepository(Users).findOne(userJwtToken.id);
        
        // Caso o usuário exista, retorna seus dados
        if (user)
            return {
                info: user,
                date: {
                    expires: String(new Date(userJwtToken.exp *1000)),
                    starts: String(new Date(userJwtToken.iat *1000))
                }
            }

        // Caso não, retorna erro
        throw new Error('O usuário não existe mais');
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
export async function getGoogleUserData(access_token: string, options?: { raise: boolean }) : Promise<google_data|null>{
    const raise_error = options? options.raise : false;
    const url = "https://www.googleapis.com/oauth2/v1/userinfo?&access_token=";
    try {
        // Pega os dados do usuário
        const { data } = await axios.get(url + access_token);
        const email = data.email;
        const { id, name, picture } = data;
        // Retorna os dados escolhidos
        return {
            email, id, name, image_url: picture
        };
    }
    // Caso token seja inválido, retorna null ou erro
    catch(err) {
        if (raise_error)
            throw err;
        
        return null;
    }
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



/**
 * Gera uma string aleatória
 */
export function getRandomValue(length: number, list?: Array<string>) {
    const value_list = list || [];
    // Certifica que não vai haver muitas tentativas
    if (value_list.length > configs.generateRandomTimes)
        return null;
    
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) 
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    
    if (value_list.includes(result))         
        return getRandomValue(length, value_list);

    return result;
}

/**
 * Randomiza um array passado como input
 */
export function randomizeArray<T>(array: Array<T>) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;   
}



/**
 * Decorator que certifica que, caso ocorra um erro, o server são será quebrado. 
 */
export function APIRoute (target: any, key:any, descriptor?: PropertyDescriptor): any {
    let func = (...data: any) => {};
    
    if (descriptor)
        func = descriptor.value;
    
    return {
        configurable: true,
        enumerable: false,
        get() {
            return async (request: APIRequest, response: Response, next: NextFunction) => {
                try {
                    await func.call(this, request, response, next);
                }
                catch(err) {
                    next(err);
                }
            }
        },
        set(newFn: any) {
            func = newFn;
        }
    };
}


/**
 * Print colorido para debug
 */
const colors = {
    blue: "\x1b[34m",
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    default: '\x1b[0m'
};
type IColors = 'green' | 'red' | 'yellow' | 'default' | 'blue';

export function messagePrint(data?: any, color?: IColors) {
    const trueColor = color ? colors[color] : colors['yellow'];
    
    console.log(trueColor, data !== undefined ? data : '', '\x1b[0m');
}