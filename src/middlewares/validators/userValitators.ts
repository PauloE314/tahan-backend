import { Users } from '../../models/User';
import { APIRequest } from 'src/@types/global';
import { Validator } from 'src/utils/classes';
import { Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';


const rules = {
    password_regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=\S*)[\S]{8,}$/,
    username_regex: /^(\p{L})+(\p{L}|\s){4,}(\p{L})+$/u,
    email_regex: /^(\S+)@(\S+)\.(\S+)$/,
    accepted_occupations: ['student', 'teacher']
};


export default class UserValidator extends Validator{

    // Validação de usuário na criação
    public createUser_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        this.clear();
        const {username, email, password, occupation} = request.body;
        

        const username_validator = await this.createFieldValidator({
            name: "username", data: username, validation: this.validate_username
        });
        const password_validator = await this.createFieldValidator({
            name: "password", data: password, validation: this.validate_password
        });
        const email_validator = await this.createFieldValidator({
            name: "email", data: email, validation: this.validate_email
        });
        const occupation_validator = await this.createFieldValidator({
            name: "occupation", data: occupation, validation: this.validate_occupation
        });


        return this.answer(request, response, next);
    }

    public login_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        this.clear();
        const { email, password } = request.body; 

        await this.createFieldValidator({
            name: "password", data: password, validation: (password) => {
                console.log(password)
                if (!password)
                    return "Envie uma senha";
            }
        });
        
        await this.createFieldValidator({
            name: "email", data: email, validation: (email) => {
                console.log(email)
                if (!email)
                    return "Envie um email";
            }
        })

        return this.answer(request, response, next);

        // return response.send('teste')
    }


    public update_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        this.clear();
        const { username, password } = request.body;
        const currentUsername = request.user.info.username;

        // Teste de nome de usuário
        const username_validator = await this.createFieldValidator({
            name: "username", data: username, validation: this.validate_username, options: { optional: true, currentUsername }
        });

        // Teste de password
        const password_validator = await this.createFieldValidator({
            name: "password", data: password, validation: this.validate_password, options: { optional: true }
        });


        return this.answer(request, response, next);
    }


    // Validator de campo
    // validação de username
    private async validate_username(username: string | undefined, options?: { currentUsername: string }){
        
        // validação de usuário
        if (rules.username_regex.test(username) && username) {
            const same_name_user = await getRepository(Users).findOne({username});
            if (same_name_user) {            
                if (!options)
                    return "Escolha outro nome de usuário, esse nome já foi escolhido anteriormente";
                else
                    if (options.currentUsername !== same_name_user.username)
                        return "Escolha outro nome de usuário, esse nome já foi escolhido anteriormente";
            }
        
            
        }
        else {
            return "Envie um nome de usuário válido - mínimo de 6 letras e apenas letras ou espaço, mas sem começar ou terminar com espaço";
        }

        return;
    }

    // validação de password
    private async validate_password(password: string | undefined, options?: any) {
        // Validação de senha
        if (!rules.password_regex.test(password) || !password)
            return "Envie uma senha válida. Ela deve conter pelo menos 8 dígitos e conter dígitos, letras minúsculas e maiúsculas, e não pode conter espaços";

        return;
    }

    // validação de email
    private async validate_email(email: string | undefined) {
        // validação básica de email
        if (rules.email_regex.test(email && email)) {
            const same_email_user = await getRepository(Users).findOne({email});
            if (same_email_user)
                return "Escolha outro email, esse já está sendo usado";
        }
        else
            return "Envie um email válido";

        return;
    }

    // validação de occupation
    private async validate_occupation(occupation: string | undefined) {
        // validação de ocupação
        if (!(rules.accepted_occupations.includes(occupation) && occupation))
            return "Envie uma ocupação válida - student ou teacher";
        
        return;
    }
}