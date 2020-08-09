import { Response, NextFunction } from 'express';
import { getRepository, Like, getCustomRepository } from 'typeorm';

import { APIRequest } from 'src/@types';
import configs from '@config/server';
import { APIRoute, paginate, filter } from 'src/utils';
import { IUsersController, IUsersValidator, IUsersRepository } from './usersTypes';

/**
 * Controlador de rotas do usuário. Essa classe concatena as funções necessárias para listagem, update, criação e delete de contas na aplicação
 */
export default class UserController implements IUsersController {

  constructor(
    public validator: IUsersValidator,
    public repository: new () => IUsersRepository,
  ) {  }

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
    // Pega dados dos query params
    const params = request.query;

    // Aplica filtro e paginação
    const users = await this.repo.findUsers(params);

    // Resposta
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

    // Valida os dados
    const validatedData = await this.validator.signIn(access_token, occupation);
    // Cria ou atualiza o usuário
    const user = await this.repo.createOrUpdate(validatedData.google_data, occupation);
    // Cria JWT
    const login_token = this.repo.createLoginToken(user.id, secret_key, jwtTime);

    return response.send({ user, login_token });
  }


  /**
   * **web: /users/:id - GET**
   * 
   * Retorna as informações de um usuário.
   */
  @APIRoute
  async read(request: APIRequest, response: Response, next: NextFunction) {
    const id = Number(request.params.id);
    // Certifica que um certo usuário existe
    const user = await this.validator.getUser(id);
    // Retorna os dados do usuário
    return response.send(user);
  }

  /**
   * **web: /users/:id/posts - GET**
   * 
   * Lista as postagens feitas por outro usuário. Permite filtro por:
   * 
   * - title: string
   * - topic: string
   */
  @APIRoute
  async posts(request: APIRequest, response: Response) {
    const id = Number(request.params.id);
    const params = request.query;

    // Certifica que o usuário existe
    const requestedUser = await this.validator.getUser(id);

    // Aplica filtros e paginação
    const posts = await this.repo.findUserPosts(requestedUser.id, params);

    // Retorna a lista
    return response.send(posts)
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
    const id = Number(request.params.id);
    const params = request.query;

    // Certifica que o usuário existe
    const requestedUser = await this.validator.getUser(id);

    // Aplica filtros e paginação
    const postContainers = await this.repo.findUserPostContainers(requestedUser.id, params);

    return response.send(postContainers);
  }

  /**
   * **web: /users/self - GET**
   * 
   * Retorna todos os dados do usuário logado.
   */
  @APIRoute
  async readSelf(request: APIRequest, response: Response, next: NextFunction) {
    // Retorna as informações do usuário
      const { user } = request;

      return response.send(user);
  }

  /**
   * **web: /users/self/quizzes - GET**
   * 
   * Lista os quizzes feitos pelo usuário. Permite filtro por:
   * 
   * - topic: number
   * - name: string
   */
  @APIRoute
  async selfQuizzes(request: APIRequest, response: Response) {
      const { user } = request;
      const params = request.query;

      // Lista de quizzes
      const serializedQuizList = await this.repo.findUserQuizzes(user.info.id, params)

      // Retorna a lista
      return response.send(serializedQuizList)
  }

   /**
   * **web: /users/self/posts - GET**
   * 
   * Lista postagens feitas pelo usuário. Permite filtro por:
   * 
   * - title: string
   * - topic: number
   */
  @APIRoute
  async selfPosts(request: APIRequest, response: Response) {
    const { user } = request;
    const params = request.query;

    // Lista de postagens
    const serializedPostList = await this.repo.findUserPosts(user.info.id, params);

    // Retorna a lista
    return response.send(serializedPostList);
  }


  /**
   * **web: /users/self/posts - GET**
   * 
   * Lista containers de postagens feitos por um usuário. Permite filtro por:
   * 
   * - name: string
   */
  @APIRoute
  async selfPostContainers(request: APIRequest, response: Response) {
    const { user } = request;
    const params = request.query;

    // Lista de containers
    const serializedPostContainerList = await this.repo.findUserPostContainers(user.info.id, params);

    return response.send(serializedPostContainerList);
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