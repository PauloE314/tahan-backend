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


interface jwt_decoded {
    id: number;
    iat: number;
    exp: number;
}



export async function auth_user(input: { token: string, raiseError: boolean, bearer?: boolean}) : Promise<user_interface | void> {
    const { bearer, raiseError, token } = input;

    const { secret_key } = configs;
    // Checa se existe um header de autenticação
    if (!token)
        if (raiseError)
            throw new Error('O usuário não apresenta autenticação - headers');
        else
            return;

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



export async function get_google_user_data(access_token: string, options?: { raise: boolean }) : Promise<google_data|null>{
    const raise_error = options? options.raise : false;
    const url = "https://www.googleapis.com/plus/v1/people/me?access_token=";
    try {
        const { data } = await axios.get(url + access_token);
        const email = data.emails[0].value;
        const { id, displayName } = data;

        return {
            email, id, displayName
        };
    }
    catch(err) {
        console.log(err.response)
        if (raise_error)
            throw err;
        
        return null;
    }
}

interface GetQuizResponse {
    returning_question: Questions,
    question: Questions
}
    

export function get_question(quiz: Quizzes, answered_questions: Array<{question_id: number}>) : GetQuizResponse | null {
    const answer_list = answered_questions ? answered_questions : [];
    const answer_id_list = answer_list.map(answer => answer.question_id);
    // Lista das questões não respondidas ainda
    const not_answered_list = quiz.questions.filter(question => !answer_id_list.includes(question.id));
    // Caso todas as questões tenham sido respondidas
    if (not_answered_list.length === 0)
        return null;

    // Pega um elemento aleatório
    const question = not_answered_list[Math.floor(Math.random() * not_answered_list.length)];
    const returning_question = Object.assign({}, question);
    delete returning_question.rightAnswer;
    // retorna o elemento
    return { question, returning_question };
}