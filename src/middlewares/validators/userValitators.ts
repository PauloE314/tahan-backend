import { Users } from '../../models/User';
import { APIRequest } from 'src/@types/global';
import { Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { remove_file } from '@config/multer';


export default class UserValidator{
    // Modelo de regras
    rules: {
        password_regex: RegExp,
        username_regex: RegExp,
        email_regex: RegExp,
        accepted_occupations: string[]
    }

    constructor(){
        this.rules = {
            password_regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=\S*)[\S]{8,}$/,
            username_regex: /^(\p{L})+(\p{L}|\s){4,}(\p{L})+$/u,
            email_regex: /^(\S+)@(\S+)\.(\S+)$/,
            accepted_occupations: ['student', 'teacher']
        }
    }

    // Validação de usuário na criação
    createUser_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        let errors = <any>{};
        const {username, email, password, occupation} = request.body;
        const file_name = request.file ? request.file.filename : undefined;
        const { password_regex, username_regex, email_regex, accepted_occupations } = this.rules;
        const userRepo = getRepository(Users);

        // Validação de senha
        if (!password_regex.test(password) || !password)
            errors.password = "Envie uma senha válida. Ela deve conter pelo menos 8 dígitos e conter dígitos, letras minúsculas e maiúsculas, e não pode conter espaços";

        
        // validação de usuário
        if (username_regex.test(username) && username) {
            const same_name_user = await userRepo.findOne({username});
            if (same_name_user)
                errors.username = "Escolha outro nome de usuário, esse nome já foi escolhido anteriormente";
        }
        else 
            errors.username = "Envie um nome de usuário válido - mínimo de 6 letras e apenas letras ou espaço, mas sem começar ou terminar com espaço";
            

        // validação básica de email
        if (email_regex.test(email && email)) {
            const same_email_user = await userRepo.findOne({email});
            if (same_email_user)
                errors.email = "Escolha outro email, esse já está sendo usado";
        }
        else
            errors.email = "Envie um email válido";


        // validação de ocupação
        if (!(accepted_occupations.includes(occupation) && occupation))
            errors.occupation = "Envie uma ocupação válida - student ou teacher";

        if (Object.keys(errors).length) {
            //Remove a imagem
            remove_file(file_name);
            return response.status(400).send({message: errors});
        }
        return next();
    }

    login_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        const { email, password } = request.body; 
        const errors = <any>{};

        if (!email)
            errors.email = "Envie o email";

        if(!password)
            errors.password = "Envie uma senha";

        if (Object.keys(errors).length)
            return response.status(400).send({message: errors})
        return next();
    }

    read_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        const id = Number(request.params.id);

        if (!isNaN(id)) {
            const userRepo = getRepository(Users);
            const user = await userRepo.findOne({id});
            if (!user) {
                return response.status(401).send({message: "Usuário não encontrado"})
            }        

            return next();
        }

        return next();
    }

    update_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        const errors = <any>{};
        const { username, password } = request.body;
        const { username_regex, password_regex } = this.rules;
        const user = request.user.info;

        const userRepo = getRepository(Users);

        // Teste de nome de usuário
        if (username) {
            if (!username_regex.test(username))
                    errors.username = "Envie um nome de usuário válido - mínimo de 6 letras e apenas letras ou espaço, mas sem começar ou terminar com espaço"

            else {
                const same_username_user = await userRepo.findOne({username});

                if (same_username_user)
                    if (same_username_user.id !== user.id)
                        errors.username = "Escolha outro nome de usuário, esse nome já foi escolhido anteriormente";
            }
        }

        // Teste de password
        if (password)
            if (!password_regex.test(password))
                errors.password = "Envie uma senha válida. Ela deve conter pelo menos 8 dígitos e conter dígitos, letras menúsculas e maiúsculas, e não pode conter espaços";

        if (Object.keys(errors).length)
            return response.status(400).send({message: errors})
        
        return next();
    }
}