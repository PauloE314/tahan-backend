import { Response, NextFunction } from 'express';
import {  getCustomRepository } from 'typeorm';

import { APIRequest } from 'src/@types';
import { APIRoute } from 'src/utils';

import configs, { codes } from '@config/server';
import UserValidator from './usersValidator';
import { UsersRepository } from './UsersRepository';


export default class UserController {
  validator = new UserValidator();
  repository = UsersRepository;

  /**
   * **web: /users/ - GET**
   * 
   * Lista os usuários da aplicação. Permite filtro por:
   * 
   * - username: string
   * - email: string
   * - occupation: string
   */
  @APIRoute
  async list(request: APIRequest, response: Response, next: NextFunction) {
    const params = request.query;

    const users = await this.repo.findUsers(params);

    return response.send(users);
  }

  /**
   * **- web: /users/sign-in/ - POST**
   * 
   * Permite acesso à aplicação utilizando OAuth. Caso o usuário já não estiver cadastrado, cria a conta.
   */
  @APIRoute
  async signIn (request: APIRequest, response: Response, next: NextFunction) {
    const { secret_key, jwtTime } = configs;
    const { access_token, occupation } = request.body;

    const validatedData = await this.validator.signIn(access_token, occupation);

    const user = await this.repo.createOrUpdate(validatedData.google_data, occupation);
    const loginToken = this.repo.createLoginToken(user.id, secret_key, jwtTime);

    return response.status(codes.CREATED).send({ user, login_token: loginToken });
  }

  /**
   * **- web: /users/refresh/ - POST**
   * 
   * Atualiza o JWT do usuário
   */
  @APIRoute
  async refresh(request: APIRequest, response: Response) {
    const { secret_key, jwtTime } = configs;
    const { id } = request.user.info;

    const newToken = this.repo.createLoginToken(id, secret_key, jwtTime);

    return response.send({ login_token: newToken });
  }


  /**
   * **web: /users/(:id|self) - GET**
   * 
   * Retorna as informações de um usuário.
   */
  @APIRoute
  async read(request: APIRequest, response: Response, next: NextFunction) {
    const { target } = request.params;

    const user = target == 'self' ?
      request.user:
      await this.validator.getUser(Number(target));

    return response.send(user);
  }

  /**
   * **web: /users/(:id|self)/posts - GET**
   * 
   * Lista as postagens feitas por um usuário. Permite filtro por:
   * 
   * - title: string
   * - topic: string
   */
  @APIRoute
  async posts(request: APIRequest, response: Response) {
    const { target } = request.params;
    const params = request.query;

    const requestedUser = target === 'self' ?
      request.user.info:
      await this.validator.getUser(Number(target));

    const teacher = this.validator.isTeacher(requestedUser);

    const posts = await this.repo.findUserPosts(teacher.id, params);

    return response.send(posts);
  }

  /**
   * **web: /users/(:id|self)/quizzer - GET**
   * 
   * Lista as quizzes feitas por um usuário. Permite filtro por:
   * 
   * - topic: number
   * - name: string
   */
  @APIRoute
  async quizzes(request: APIRequest, response: Response) {
    const { target } = request.params;
    const params = request.query;

    // Pega o alvo da requisição
    const requestedUser = target == 'self' ?
      request.user.info:
      await this.validator.getUser(Number(target));

    // const teacher = this.validator.isTeacher(requestedUser);
    const teacher = requestedUser;

    const quizzes = await this.repo.findUserQuizzes({
      params,
      user: teacher,
      getPrivates: request.user.info.id === requestedUser.id
    });

    return response.send(quizzes);
  }

  /**
   * **web: /users/:id/post-containers - GET**
   * 
   *  Listagem de containers de outro usuário. Permite filtro por:
   * 
   * - name: string
   */
  @APIRoute
  async postContainers(request: APIRequest, response: Response) {
    const { target } = request.params;
    const params = request.query;

    const requestedUser = target == 'self' ?
      request.user.info:
      await this.validator.getUser(Number(target));
      
    const teacher = this.validator.isTeacher(requestedUser);

    const postContainers = await this.repo.findUserPostContainers(teacher.id, params);

    return response.send(postContainers);
  }



  
  /**
   * **web: /users/ - DELETE**
   * 
   * Deleta o usuário
   */ 
  @APIRoute
  async delete(request: APIRequest, response: Response, next: NextFunction) {
    await this.repo.deleteUser(request.user.info);

    return response.send({ message: 'Usuário removido com sucesso' });
  }
  
  get repo() {
    return getCustomRepository(this.repository);
  }
}