import { Users } from '../../models/User';
import { APIRequest } from 'src/@types/global';
import { Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';


const rules = {
    password_regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=\S*)[\S]{8,}$/,
    // password_regex: new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{8,})"),
    username_regex: /^(\p{L}\w*){5,}$/u,
    email_regex: /^(\S+)@(\S+)\.(\S+)$/,
    accepted_occupations: ['student', 'teacher']
}



export default class UserValidator{

    // Validação de usuário na criação
    async createUser_validation(request: APIRequest, response: Response, next: NextFunction) {
        
        let errors = <any>{};
        const {username, email, password, occupation} = request.body;
        const { password_regex, username_regex, email_regex, accepted_occupations } = rules;
        const userRepo = getRepository(Users)

        // Validação de senha
        if (!password_regex.test(password) || !password)
            errors.password = "Envie uma senha válida. Ela deve conter pelo menos 8 dígitos e conter dígitos, letras menúsculas e maiúsculas, e não pode conter espaços";

        // validação de usuário
        if (username_regex.test(username) && username) 
            if (await userRepo.find({username}))
                errors.username = "Escolha outro nome de usuário, esse nome já foi escolhido anteriormente";
        
        else
            errors.username = "Envie um nome de usuário válido - mínimo de 6 letras e apenas letras ou espaço, mas sem começar ou terminar com espaço"

        // validação básica de email
        if (!(email_regex.test(email) && email))
            errors.email = "Envie um email válido";


        // validação de ocupação
        if (!(accepted_occupations.includes(occupation) && occupation))
            errors.occupation = "Envie uma ocupação válida - student ou teacher";

        if (Object.keys(errors))
            return response.status(400).send({errors})
        
        return next();
    }
}

// export async function login_validator(data) {
//     const { username, password } = data; 
//     const errors = <any>{};

//     if (!username)
//         errors.username = "Envie um nome de usuário";

//     if(!password)
//         errors.password = "Envie uma senha";

// }


// export async function update_validator(data) {
//     const errors = <any>{};
//     const { username, password, user_id } = data;
//     const { username_regex, password_regex } = rules;

//     // Teste de nome de usuário
//     if (username) {
//         if (!username_regex.test(username))
//                 errors.username = "Envie um nome de usuário válido - mínimo de 6 letras e apenas letras ou espaço, mas sem começar ou terminar com espaço"

//         else {
//             const same_username_user = await db('users')
//                 .select('*')
//                 .where('username', String(username))
//                 .first()

//             if (same_username_user)
//                 if (same_username_user.id !== user_id)
//                     errors.username = "Escolha outro nome de usuário, esse nome já foi escolhido anteriormente";
//         }
//     }

//     // Teste de password
//     if (password)
//         if (!password_regex.test(password))
//             errors.password = "Envie uma senha válida. Ela deve conter pelo menos 8 dígitos e conter dígitos, letras menúsculas e maiúsculas, e não pode conter espaços";

// }