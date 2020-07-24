import { Users } from '@models/User';
import { APIRequest } from 'src/@types';
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

/**
 * Classe de validação de rotas do usuário
 */
export default class UserValidator extends Validator{

    /**
     * Validação de entrada na aplicação, tanto para login, quanto para criação de usuário
     */
    public signIn_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        this.clear();
        // Certifica que há um código de acesso
        const { access_token, occupation } = request.body;

        if (!access_token)
            return response.status(400).send({message: "Envie um token OAuth"});
            
        // Pega os dados google
        const google_data = await get_google_user_data(access_token);

        // Caso os dados sejam nulos, reporta o erro
        if(!google_data)
            return response.status(400).send({message: "Algum erro ocorreu e não foi possível pegar os dados do usuário google, talvez o token enviado não seja válido"});

        // Validação de email
        const email_validation = await this.createFieldValidator({
            name: "email", data: google_data.email, validation: this.validate_email
        });

        // Validação de ocupação (temporário)
        const occupation_validation = await this.createFieldValidator({
            name: 'occupation', data: occupation, validation: this.validate_occupation
        });

        request.google_data = google_data;

        // Retorna a resposta
        return this.answer(request, response, next);
        
    }


    /**
     * Validação de email
     */
    private async validate_email(email: string | undefined) {
        // // Pega a terminação do email
        // const email_end = email.split('@')[1];
        // // Checa se o email é acadêmico
        // if (email_end !== 'academico.ifpb.edu.br' && email_end !== 'ifpb.edu.br')
        //     return 'Envie um email acadêmico do IFPB'
    }

    /**
     * Temporário
     */
    private async validate_occupation(occupation: string | undefined) {
        if (occupation !== 'student' && occupation !== 'teacher')
            return "Envie uma ocupação válida"
    }
}