import { Users } from '../../models/User';
import { APIRequest } from 'src/@types/global';
import { Validator } from 'src/utils/classes';
import { Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { get_google_user_data } from 'src/utils';


const rules = {
    password_regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=\S*)[\S]{8,}$/,
    username_regex: /^(\p{L})+(\p{L}|\s){4,}(\p{L})+$/u,
    email_regex: /^(\S+)@(\S+)\.(\S+)$/,
    accepted_occupations: ['student', 'teacher']
};


export default class UserValidator extends Validator{

    public createUser_validation = (request: APIRequest, response: Response, next: NextFunction) => {
        const { method } = request.body;

        const valid_methods = ['google', 'manual'];

        // Certifica o método
        if (!valid_methods.includes(method))
            return response.status(400).send({message: "Envie o método válido"});

        // Escolhe o método de criação
        else {
            // Manual
            if (method == 'manual')
                return this.create_manual_user_validation(request, response, next);
            // Google
            else
                return this.create_google_user_validation(request, response, next);
        }
    }

    // Validação de criação manual de usuário
    private create_manual_user_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
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
        // Temporário
        const occupation_validator = await this.createFieldValidator({
            name: "occupation", data: occupation, validation: this.validate_occupation
        });


        return this.answer(request, response, next);
    }
    
    // Validação de criação de usuário google
    private create_google_user_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        this.clear();
        const { access_token, occupation } = request.body;

        if (!access_token)
            return response.status(400).send({message: "Envie um token OAuth"});

        try {
            // Pega os dados google
            const google_data = await get_google_user_data(access_token);
            console.log(google_data)

            // Caso os dados sejam nulos, reporta o erro
            if(!google_data)
                return response.status(400).send({message: "Algum erro ocorreu e não foi possível pegar os dados do usuário google, talvez o token enviado não seja válido"});

            // Validação de usuário com mesmo googleID
            const same_user_validation = await this.createFieldValidator({
                name: "user", data: google_data.id, validation: async (id: string) => {
                    const same_id_user = await getRepository(Users).findOne({googleID: google_data.id});
                    if (same_id_user)
                        return "Já existe um usuário com essa conta google em nosso sistema";
                }
            });

            // Validação de email
            const email_validation = await this.createFieldValidator({
                name: "email", data: google_data.email, validation: this.validate_email
            })

            // Temporário
            const occupation_validator = await this.createFieldValidator({
                name: "occupation", data: occupation, validation: this.validate_occupation
            });

            request.google_data = google_data;

            // Retorna a resposta
            return this.answer(request, response, next);
        }
        catch(err) {
            // Caso ocorra um erro desconhecido, retorna-o
            const {name, message} = err;
            return response.status(500).send({name, message});
        }        
    }
    

    
    public login_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        this.clear();
        const { email, password, method, access_token } = request.body;
        const valid_methods = ['google', 'manual'];

        // Certifica que um dos métodos tenha sido escolhido
        if (!valid_methods.includes(method))
            return response.status(400).send({method: "Envie um método válido"})

        if (method == 'google') {
            const google_data = await get_google_user_data(access_token);
            
            // Valida o token do google
            if (!google_data)
                return response.status(401).send({access_token: "Ocorreu um erro com o token OAuth, ele pode ser inválido ou inativo"});


            request.google_data = google_data;
        }
        // Login manual
        else {
            // Valida o campo de senha
            await this.createFieldValidator({
                name: "password", data: password, validation: (password) => {
                    if (!password)
                        return "Envie uma senha";
                }
            });
            // Valida o email
            await this.createFieldValidator({
                name: "email", data: email, validation: (email) => {
                    if (method == 'manual' && !email)
                        return "Envie um email";
                    return;
                }
            })
        }

        return this.answer(request, response, next);
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
        if (!rules.username_regex.test(username) && username) {
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