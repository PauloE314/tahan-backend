import { Users } from '@models/User';
import { validateFields } from 'src/utils/baseValidator';
import { getRepository } from 'typeorm';
import { getGoogleUserData } from 'src/utils';
import { BaseValidator } from 'src/utils/baseValidator';


/**
 * Classe de validação de rotas do usuário
 */
export class UserValidator extends BaseValidator {

    /**
     * **Validação de entrada na aplicação, tanto para login, quanto para criação de usuário.**
     * 
     * users/ - POST
     */
    public async signIn (access_token: any, occupation: any) {
        
        // Pega os dados do google
        const google_data = await getGoogleUserData(access_token);

        // Certifica que ele existe
        if (!google_data)
            this.RaiseError("Algum erro ocorreu e não foi possível pegar os dados do usuário");

        // Validação de email e ocupação
        const validated_data = await validateFields({
            // Validação de email (nada por enquanto)
            email: {
                data: google_data.email,
                rules: checker => checker.custom(validate_email)
            },
            // Validação de ocupação
            occupation: {
                data: occupation,
                rules: (checker => (
                    checker
                        .exists("Esse campo é obrigatório [temporário]")
                        .isString("Dado inválido [temporário]")
                        .isEqualTo(['student', 'teacher'], "Ocupação inválida")
                ))
            }
        });

        // Retorna a resposta
        return {
            google_data,
            occupation: validated_data.occupation
        } 
    }

    /**
     * Certifica que um usuário existe
     */
    public async getUser(id: any, message?: string) {
        const user = await getRepository(Users).findOne(id);

        if (!user)
            this.RaiseError(message || "Usuário não encontrado");

        return user;
    }

    /**
     * Certifica que o usuário é um professor
     */
    public isTeacher(target: Users) {        
        if (target.occupation !== 'teacher')
            this.RaiseError("O usuário não é um professor", 400);

        return target;
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
