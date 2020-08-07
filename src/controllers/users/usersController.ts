import { Response, NextFunction } from 'express';
import { getRepository, Like, getCustomRepository } from 'typeorm';

import { APIRequest } from 'src/@types';
import { Users } from '@models/User';
import configs from '@config/server';
import { Quizzes } from '@models/quiz/Quizzes';
import { Posts } from '@models/Posts/Posts';
import { Containers } from '@models/Posts/Containers';
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
  // @APIRoute
  async list(request: APIRequest, response: Response, next: NextFunction) {
    // Pega dados dos query params
    const { username, email, occupation } = request.query;

    const users = getRepository(Users)
      .createQueryBuilder('user')

    // Aplica filtro
    const filtered = filter(users, {
      username: { like: username },
      email: { like: email },
      occupation: { like: occupation }
    });
      
    // Aplica paginação
    const users_data = await paginate(filtered, request);

    // Resposta
    return response.send(users_data);
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
    // Tenta pegar um usuário com esse ID
    const user = await getRepository(Users).findOne({ id });
    // Caso ele não exista, envia erro
    if (!user)
        return response.status(404).send({message: "Usuário não encontrado"})
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
    const { title, topic } = request.query;

    // Lista de postagens
    const posts = getRepository(Posts)
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.topic', 'topic')
      .where('post.author = :id', { id })

    // Aplica filtros
    const filtered = filter(posts, {
      author: { equal: id },
      topic: { equal: topic },
      title: { like: title }
    })
    // Aplica paginação
    const posts_data = await paginate(filtered, request);

    // Retorna a lista
    return response.send(posts_data)
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
    const { name } = request.query;

    // Lista de containers
    const post_containers = getRepository(Containers)
      .createQueryBuilder('container')
      .leftJoin('container.posts', 'posts')
      .select(['container', 'posts'])

    // Aplica filtros
    const filtered = filter(post_containers, {
      name: { like: name },
      author: { equal: id }
    })

    // Aplica paginação
    const post_containers_data = await paginate(filtered, request);

    return response.send(post_containers_data);
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
      const { topic, name } = request.query;

      // Lista de quizzes
      const quizzes = getRepository(Quizzes)
        .createQueryBuilder('quiz')
        .loadRelationIdAndMap('quiz.questions', 'quiz.questions')
      
      // Aplica filtro
      const filtered = filter(quizzes, {
        author: { equal: user.info.id },
        topic: { equal: topic },
        name: { like: name }
      });

      // Aplica paginação
      const quizzes_data = await paginate(filtered, request);

      // Retorna a lista
      return response.send(quizzes_data)
  }

   /**
   * **web: /users/self/posts - GET**
   * 
   * Lista postagens feitas pelo usuário. Permite filtro por:
   * 
   * - title: string
   */
  @APIRoute
  async selfPosts(request: APIRequest, response: Response) {
    const { user } = request;
    const { title } = request.query;

    // Lista de postagens
    const posts =  getRepository(Posts)
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.topic', 'topic')

    // Aplica filtro
    const filtered = filter(posts, {
      author: { equal: user.info.id },
      title: { like: title }
    });

    // Aplica paginação
    const posts_data = await paginate(filtered, request);

    // Retorna a lista
    return response.send(posts_data);
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
    const { name } = request.query;

    // Lista de containers
    const post_containers = getRepository(Containers)
      .createQueryBuilder('container')
      .leftJoinAndSelect('container.posts', 'posts')
    
    // Aplica filtros
    const filtered = filter(post_containers, {
      author: { equal: user.info.id },
      name: { equal: name }
    });

    // Aplica paginação
    const post_containers_data = await paginate(filtered, request);

    return response.send(post_containers_data);
  }

  
  /**
   * **web: /users/ - DELETE**
   * 
   * Deleta o usuário
   */ 
  @APIRoute
  async delete(request: APIRequest, response: Response, next: NextFunction) {
    const user = request.user.info;

    await getRepository(Users).remove(user);

    return response.send({ message: 'Usuário removido com sucesso' });
  }
  
  get repo() {
    return getCustomRepository(this.repository);
  }

  
}