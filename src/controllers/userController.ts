import { Response, NextFunction } from 'express';
import { getRepository, Like } from 'typeorm';
import jwt from 'jsonwebtoken';

import { APIRequest } from 'src/@types';
import { Users } from '@models/User';
import configs from '@config/server';
import { Quizzes } from '@models/quiz/Quizzes';
import { Posts } from '@models/Posts/Posts';
import { Containers } from '@models/Posts/Containers';
import { SafeMethod, paginate, filter } from 'src/utils';

/**
 * Controlador de rotas do usuário. Essa classe concatena as funções necessárias para listagem, update, criação e delete de contas na aplicação
 */
export default class UserController {
  /**
   * **web: /users/ - GET**
   * 
   * Lista os usuários da aplicação. Permite filtro por:
   * 
   * - username: string
   * - email: string
   * - occupation: string
   */
  @SafeMethod
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
  @SafeMethod
  async sign_in (request: APIRequest, response: Response, next: NextFunction) {
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
   * **web: /users/:id - GET**
   * 
   * Retorna as informações de um usuário.
   */
  @SafeMethod
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
  @SafeMethod
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
  @SafeMethod
  async post_containers(request: APIRequest, response: Response) {
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
  @SafeMethod
  async read_self(request: APIRequest, response: Response, next: NextFunction) {
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
  @SafeMethod
  async self_quizzes(request: APIRequest, response: Response) {
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
  @SafeMethod
  async self_posts(request: APIRequest, response: Response) {
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
  @SafeMethod
  async self_post_containers(request: APIRequest, response: Response) {
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
   * Deleta o usuário
   */ 
  @SafeMethod
  async delete(request: APIRequest, response: Response, next: NextFunction) {
    const user = request.user.info;

    await getRepository(Users).remove(user);

    return response.send({ message: 'Usuário removido com sucesso' });
  }

  
}

/**
 * Retorna a ocupação do usuário dado o seu email acadêmico.
 */
function get_occupation(email: string): 'student' | 'teacher' {
  // Pega a terminação do email
  const email_end = email.split('@')[1];
  // Checa se é estudante
  if (email_end == 'academico.ifpb.edu.br')
    return 'student'
  // Ou professor
  else
    return 'teacher'
}