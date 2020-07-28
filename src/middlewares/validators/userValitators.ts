import { Users } from '@models/User';
import { APIRequest } from 'src/@types';
import { Validator, is_string } from 'src/utils/validators';
import { Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { get_google_user_data } from 'src/utils';


/**
 * Classe de validação de rotas do usuário
 */
export default class UserValidator {

    /**
     * **Validação de entrada na aplicação, tanto para login, quanto para criação de usuário.**
     * 
     * users/ - POST
     */
    public signIn_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        const { access_token, occupation } = request.body;
        const validator = new Validator();

        // Validação do token
        const token_validation = await validator.validate({ access_token }, [is_string]);
        // Avisa a resposta
        if (token_validation)
            return validator.resolve(request, response, next);
            
        // Pega os dados google
        const google_data = await get_google_user_data(access_token);

        // Caso os dados sejam nulos, reporta o erro
        if(!google_data)
            return response.status(400).send({message: "Algum erro ocorreu e não foi possível pegar os dados do usuário google, talvez o token enviado não seja válido"});

        // Validação de email
        await validator.validate({ email: google_data.email }, [validate_email]);

        // Validação de ocupação (temporário)
        await validator.validate({ occupation }, [is_string, validate_occupation]);

        request.google_data = google_data;

        // Retorna a resposta
        return validator.resolve(request, response, next);
        
    }
}

/**
 * Validação de email
 */
async function validate_email(data: string) {
    // // Pega a terminação do email
    // const email_end = email.split('@')[1];
    // // Checa se o email é acadêmico
    // if (email_end !== 'academico.ifpb.edu.br' && email_end !== 'ifpb.edu.br')
    //     return 'Envie um email acadêmico do IFPB'
}

/**
 * Temporário
 */
async function validate_occupation(data: string) {
    if (data !== 'student' && data !== 'teacher')
        return "Envie uma ocupação válida"
}

