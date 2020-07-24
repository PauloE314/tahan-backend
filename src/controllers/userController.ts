import { Response, NextFunction } from 'express';
import { getRepository, Like } from 'typeorm';
import jwt from 'jsonwebtoken';
import crypto from 'bcrypt';

import { APIRequest } from 'src/@types';
import { Users } from '@models/User';
import configs from '@config/server';

/**
 * Controlador de rotas do usuário. Essa classe concatena as funções necessárias para listagem, update, criação e delete de contas na aplicação
 */
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

  /**
   * Permite acesso à aplicação utilizando OAuth. Caso o usuário já não estiver cadastrado, cria a conta
   */
  sign_in = async (request: APIRequest, response: Response, next: NextFunction) => {
    const { secret_key, jwtTime } = configs;
    const { google_data, body } = request;
    // Tenta pegar o usuário
    const user = await getRepository(Users).findOne({ googleID: google_data.id });
    // Atualiza / cria o usuário
    const actual_user = user ? user : new Users();
    actual_user.email = google_data.email;
    actual_user.username = google_data.displayName;
    actual_user.image_url = google_data.image_url;
    // Caso o usuário não exista ainda
    if (!user) {
      actual_user.googleID = google_data.id
      actual_user.occupation = body.occupation;
    }

    // Atualiza ou cria o usuário
    const saved_user = await getRepository(Users).save(actual_user);
    // Cria um token JWT para o usuário
    const login_token = jwt.sign({ id: saved_user.id }, secret_key, { expiresIn: jwtTime });
    
    // Certifica que o google_id do usuário não será enviado
    if (saved_user.googleID)
      delete saved_user.googleID;
    // Retorna seus dados
    return response.send({ user: saved_user, login_token });
  }


  /**
   * Retorna as informações de um usuário
   */
  async read(request: APIRequest, response: Response, next: NextFunction) {
    const id = Number(request.params.id);
    // Tenta pegar um usuário com esse ID
    const user = await getRepository(Users).findOne({ id });
    // Caso ele não exista, envia erro
    if (!user)
        return response.status(404).send({message: "Usuário não encontrado"})
    // Retorna os dados do usuário
    return response.send(user);
  }

  // Retorna as informações do usuário logado
  async read_self(request: APIRequest, response: Response, next: NextFunction) {
    // Retorna as informações do usuário
      const { user } = request;

      return response.send(user);
  }

  
  /**
   * Deleta o usuário
   */ 
  async delete(request: APIRequest, response: Response, next: NextFunction) {
    const user = request.user.info;

    await getRepository(Users).remove(user);

    return response.send({ message: 'Usuário removido com sucesso' });
  }

  /**
   * Retorna a ocupação do usuário dado o seu email acadêmico.
   */
  get_occupation(email: string): 'student' | 'teacher' {
    // Pega a terminação do email
    const email_end = email.split('@')[1];
    // Checa se é estudante
    if (email_end == 'academico.ifpb.edu.br')
      return 'student'
    // Ou professor
    else
      return 'teacher'
  }
}
