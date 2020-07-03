import { Response, NextFunction } from 'express';
import { getRepository, Like } from 'typeorm';
import jwt from 'jsonwebtoken';
import crypto from 'bcrypt';

import { APIRequest } from 'src/@types/global';
import { Users } from '@models/User';
import configs from '@config/server';

async function create_user(input: { username: string, email: string, occupation: string, password?: string, googleID?: string}) {
  const { username, email, occupation, password, googleID } = input;
  const user = new Users();
  user.username = username;
  user.email = email;
  user.occupation = occupation;
  
  // Se tiver senha, salva-a
  if (password)
    user.password = password;

  // Se tiver um ID do google, salva-a
  if (googleID)
    user.googleID = googleID;

  const saved_user = await getRepository(Users).save(user);
  // deleta senha
  delete saved_user.password;

  return saved_user;
}

async function get_occupation(email: string) {
  // TODO
}

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
    create = async (request: APIRequest, response: Response, next: NextFunction) => {
      const { method, username, email, password } = request.body;
      const { google_data } = request;

      // temporário
      const { occupation } = request.body;
      
      // Criando usuário com google
      if (method == 'google') {        
        const user = await create_user({username: google_data.displayName, email: google_data.email, occupation, googleID: google_data.id });
        return response.send(user);
      }
      // Criando manualmente
      else {
        const user = await create_user({username, email, occupation, password});
        return response.send(user);
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
    login = async (request: APIRequest, response: Response, next: NextFunction) => {
      const { method } = request.body;
      const { secret_key, jwtTime } = configs;

      // Sistema de login com o google
      async function google_login(request: APIRequest, response: Response) : Promise<Users|object> {
        const userRepo = getRepository(Users);
        
        const { google_data } = request;

        const user = await userRepo.findOne({googleID: google_data.id});

        // Caso não exista um usuário cadastrado com esse googleID
        if (!user) 
          return { googleId: "Não existe nenhum usuário cadastrado com esse ID" };

        return user;
      }
      // Sistema de login manual
      async function manual_login(request: APIRequest, response: Response) : Promise<Users|object> {
        const userRepo = getRepository(Users);
        const { email, password} = request.body;

        // Login manual
        const user = await userRepo
          .createQueryBuilder("users")
          .addSelect("users.password")
          .where('users.email = :email', { email })
          .getOne();

        // Caso não exista um usuário com esse username
        if (!user) 
          return { email: 'Email inválido' }

        // Caso exista, compara a senha enviada e a do usuário
        const rightPassword = crypto.compareSync(password, user.password);

        // Caso não forem iguais, retorna erro
        if (!rightPassword) 
          return { password: 'Senha inválida' };

        // Deleta a senha
        delete user.password;

        return user;
      }

      const user_or_error = method == 'google' ? await google_login(request, response) : await manual_login(request, response);

      if (!(user_or_error instanceof Users))
        return response.status(400).send(user_or_error);

  
      // Armazena os dados do usuário
      const login_token = jwt.sign({ id: user_or_error.id }, secret_key, { expiresIn: jwtTime });

      // Retorna os dados
      return response.send({user: user_or_error, token: login_token})  
    }
}
