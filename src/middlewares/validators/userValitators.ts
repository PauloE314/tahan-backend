import { Users } from '../../models/User';
import { APIRequest, FieldValidator, Validator } from 'src/@types/global';
import { Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { remove_file } from '@config/multer';

const rules = {
    password_regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=\S*)[\S]{8,}$/,
    username_regex: /^(\p{L})+(\p{L}|\s){4,}(\p{L})+$/u,
    email_regex: /^(\S+)@(\S+)\.(\S+)$/,
    accepted_occupations: ['student', 'teacher']
};


export default class UserValidator extends Validator{

    // Validação de usuário na criação
    public createUser_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        let errors = <any>{};
        const {username, email, password, occupation} = request.body;

        const username_validator = await this.validate_username(username);
        const password_validator = await this.validate_password(password);
        const email_validator = await this.validate_email(email);
        const occupation_validator = await this.validate_occupation(occupation);

        // Validação de senha
        if (!password_validator.isValid)
            errors.password = password_validator.message;

        
        // validação de usuário
        if(!username_validator.isValid)
            errors.username = username_validator.message;         

        // validação básica de email
        if (!email_validator.isValid) 
            errors.email = email_validator.message;
          

        // validação de ocupação
        if (!occupation_validator.isValid)
            errors.occupation = occupation_validator.message;


        return this.handle_errors_or_next(errors, request, response, next);
    }

    public login_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        const { email, password } = request.body; 
        const errors = <any>{};

        const password_validator = await this.validate_password(password);

        if (!rules.email_regex.test(email) || !email)
            errors.email = "Envie um email válido";

        if (!password_validator.isValid)
            errors.password = password_validator.message;

        return this.handle_errors_or_next(errors, request, response, next);
    }

    public read_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
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

    public update_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        const errors = <any>{};
        const { username, password } = request.body;
        const currentUsername = request.user.info.username;

        const username_validator = await this.validate_username(username, { currentUsername });
        const password_validator = await this.validate_password(password);

        // Teste de nome de usuário
        if (username)
            if (!username_validator.isValid)
                errors.username = username_validator.message;

        // Teste de password
        if (password)
            if (!password_validator.isValid)
                errors.password = password_validator.message;

        return this.handle_errors_or_next(errors, request, response, next);
    }


    // Validator de campo
    // validação de username
    private async validate_username(username: string | undefined, options?: { currentUsername: string }) : Promise<FieldValidator> {
        const response = new FieldValidator();

        // validação de usuário
        if (rules.username_regex.test(username) && username) {
            const same_name_user = await getRepository(Users).findOne({username});
            if (same_name_user) {            
                if (!options)
                    response.setInvalid("Escolha outro nome de usuário, esse nome já foi escolhido anteriormente")
                else
                    if (options.currentUsername !== same_name_user.username)
                        response.setInvalid("Escolha outro nome de usuário, esse nome já foi escolhido anteriormente")
            }
        
            
        }
        else 
            response.setInvalid("Envie um nome de usuário válido - mínimo de 6 letras e apenas letras ou espaço, mas sem começar ou terminar com espaço");

        return response;
    }

    // validação de password
    private async validate_password(password: string | undefined) : Promise<FieldValidator> {
        const response = new FieldValidator();
        // Validação de senha
        if (!rules.password_regex.test(password) || !password)
            response.setInvalid("Envie uma senha válida. Ela deve conter pelo menos 8 dígitos e conter dígitos, letras minúsculas e maiúsculas, e não pode conter espaços");

        return response;
    }

    // validação de email
    private async validate_email(email: string | undefined) : Promise<FieldValidator> {
        const response = new FieldValidator();
        // validação básica de email
        if (rules.email_regex.test(email && email)) {
            const same_email_user = await getRepository(Users).findOne({email});
            if (same_email_user)
                response.setInvalid("Escolha outro email, esse já está sendo usado");
        }
        else
            response.setInvalid("Envie um email válido");

        return response;
    }

    // validação de occupation
    private async validate_occupation(occupation: string | undefined) : Promise<FieldValidator> {
        const response = new FieldValidator();

        // validação de ocupação
        if (!(rules.accepted_occupations.includes(occupation) && occupation))
            response.setInvalid("Envie uma ocupação válida - student ou teacher");
        
        return response;
    }
}