import { Response, NextFunction } from 'express';
import { getRepository, Like } from 'typeorm';
import jwt from 'jsonwebtoken';
import { get_google_user_data } from 'src/utils/index';
import crypto from 'bcrypt';

import { APIRequest } from 'src/@types/global';
import { Users } from '@models/User';
import configs from '@config/server';

export default class UserController {
  // Lista todos os usuários com pesquisa
    async list(request: APIRequest, response: Response, next: NextFunction) {
        const filter_fields = ['username', 'email'];
        const query_params = request.query;
        const queries = {};

        // Checa se os campos são válidos
        const valid_fields = Object.keys(query_params).filter((element) => filter_fields.includes(element));

        // Põe a sintaxe de "like" do sql
        valid_fields.forEach((query) => {
          queries[query] = Like(`%${query_params[query]}%`);
        });

        const userRepo = getRepository(Users);

        // Encontra os usuários e os retorna
        const user_list = await userRepo.find(queries);
        return response.send(user_list);
    }

  // Cria um usuário
    async create(request: APIRequest, response: Response, next: NextFunction) {
        const { method, username, email, password, occupation, access_token } = request.body;
        const { google_data } = request;
        const userRepo = getRepository(Users);

        try {
            const user = new Users();
            user.password = crypto.hashSync(password, 10);
            user.occupation = occupation;

            if (method == 'google') {
                const { displayName, email, id } = google_data;
                user.username = displayName;
                user.email = email;
                user.googleID = id;
            }
            else {
                user.username = username;
                user.email = email;
            }
                
            const new_user = await userRepo.save(user);
            return response.send(new_user);
        } catch (err) {
            response.status(500).send({ message: err.message, name: err.name });
        }
    }

  // Retorna as informações de um usuário
    async read(request: APIRequest, response: Response, next: NextFunction) {
        const id = Number(request.params.id);
        // Caso esteja sendo passado um ID na URL, tenta encontrá-lo, se não, passa para a próxima URL
        const user = await getRepository(Users).findOne({ id });

        if (!user)
            return response.status(401).send({message: "Usuário não encontrado"})

        return response.send(user);
    }

  // Retorna as informações do usuário logado
    async read_self(request: APIRequest, response: Response, next: NextFunction) {
      // Retorna as informações do usuário
        const { user } = request;

        return response.send(user);
    }

  // Update de informações do usuário
    async update(request: APIRequest, response: Response, next: NextFunction) {
        const { username, password } = request.body;
        const user = request.user.info;
        const userRepo = getRepository(Users);

        // Se o username estiver sendo atualizado
        if (username)
            user.username = username;

        // Se a senha estiver sendo atualizada
        if (password)
          user.password = crypto.hashSync(password, 10);

        const updated_user = await userRepo.save(user);
        return response.send(updated_user);
    }

    // Deleta o usuário
    async delete(request: APIRequest, response: Response, next: NextFunction) {
        const userRepo = getRepository(Users);
        const user = request.user.info;

        await userRepo.remove(user);

        return response.send({ message: 'Usuário removido com sucesso' });
    }

    // Login
    async login(request: APIRequest, response: Response, next: NextFunction) {
        const { secret_key, jwtTime } = configs;
        const { email, password, method, access_token} = request.body;

        const userRepo = getRepository(Users);

        const user_email = method == 'google' ? (await get_google_user_data(access_token)).email : email;
        console.log(user_email)

        const user = await userRepo
          .createQueryBuilder("users")
          .addSelect("users.password")
          .where('users.email = :email', { email: user_email })
          .getOne();

        

        // Caso não exista um usuário com esse username
        if (!user) 
          return response.status(400).send({ email: 'Email inválido' });

        // Caso exista, compara a senha enviada e a do usuário
        const rightPassword = crypto.compareSync(password, user.password);


        // Caso não forem iguais, retorna erro
        if (!rightPassword) 
           return response.status(400).send({ password: 'Senha inválida' }); 

        // Se forem iguais, autializa o JWT
        const login_token = jwt.sign({ id: user.id }, secret_key, { expiresIn: jwtTime });

        // Retorna as informações do usuário
        delete user.password;

        return response.send({ user, token: login_token });
    }

//     async check_JWT(request: APIRequest, response: Response) {
//       const user = request.user;

//       return response.send(user);
//     }
}
