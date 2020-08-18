import { EntityRepository, getRepository } from "typeorm";
import { Users } from "@models/User";
import { BaseRepository, IPaginatedData } from "src/utils/baseRepository";
import { google_data } from "src/@types";
import jwt from 'jsonwebtoken';
import { Posts } from "@models/Posts/Posts";
import { Containers } from "@models/Posts/Containers";
import { Quizzes } from "@models/quiz/Quizzes";


interface IUserQuizzesInput {
    user: Users,
    params: any,
    getPrivates: boolean    
}


@EntityRepository(Users)
export class UsersRepository extends BaseRepository<Users> {

    /**
     * Filtra e lista os usuários da aplicação 
     */
    async findUsers(params: any): Promise<IPaginatedData<Users>> {
        const usersQueryBuilder = this.createQueryBuilder('user');

        // Aplica filtro e paginação
        const serializedData = await this.filterAndPaginate(usersQueryBuilder, {
            count: params.count,
            page: params.page,
            filter: {
                username: { operator: 'like', data: params.username },
                email: { operator: 'like', data: params.email },
                occupation: { operator: 'like', data: params.occupation },
            }
        });

        return serializedData;
    }


    /**
     * Cria ou atualiza um usuário
     */
    async createOrUpdate(data: google_data, occupation: 'teacher' | 'student') {
        // Tenta pegar o usuário
        const oldUser = await this.createQueryBuilder('user')
            .where('googleID = :id', { id: data.id })
            .getOne();

        const user = oldUser || new Users();
        // Atualiza dados do usuário
        user.email = data.email;
        user.image_url = data.image_url;
        user.username = data.name;
        user.googleID = data.id;
        // Seta a ocupação apenas uma vez
        if (!oldUser)
            user.occupation = occupation;
            
        const saved = await this.save(user);

        // Normatiza dados
        delete saved.googleID;
        // Retorna user
        return saved;
    }

    /**
     * Cria um token para login (JWT)
     */
    createLoginToken(id: number, secret_key: string, expireTime: any) {
        return jwt.sign({ id }, secret_key, { expiresIn: expireTime });
    }

    /**
     * Encontra os posts de um usuário.
     */
    async findUserPosts(authorId: any, params: any) {
        // Lista de postagens
        const postsQueryBuilder = getRepository(Posts)
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.topic', 'topic')
            .where('post.author = :id', { id: authorId })

        // Aplica paginação e filtragem
        const serializedPostList = await this.filterAndPaginate(postsQueryBuilder, {
            count: params.count,
            page: params.page,
            filter: {
                title: { operator: 'like', data: params.title },
                topic: { operator: 'equal', data: params.topic }
            }
        })

        return serializedPostList;
    }

    /**
     * Encontra containers do usuário
     */
    async findUserPostContainers(authorId: any, params: any) {
        // Lista de containers
        const post_containers = getRepository(Containers)
            .createQueryBuilder('container')
            .loadRelationIdAndMap('container.posts', 'container.posts')
            .leftJoin('container.author', 'author');

        // Aplica filtros
        const serializedPostContainerList = await this.filterAndPaginate(post_containers, {
            count: params.count,
            page: params.page,
            filter: {
                name: { operator: 'like', data: params.name },
                author: { operator: 'equal', data: authorId },
            }
        });

        return serializedPostContainerList;
    }
   
    async findUserQuizzes({ user, params, getPrivates }: IUserQuizzesInput) {
        
        // Lista de quizzes
        const quizzes = getRepository(Quizzes)
            .createQueryBuilder('quiz')
            .leftJoinAndSelect('quiz.topic', 'topic')
            .loadRelationIdAndMap('quiz.questions', 'quiz.questions')
            .addSelect('quiz.mode')

        if (!getPrivates)
            quizzes.where('quiz.mode = "public"');
        
        // Aplica filtro e paginação
        const serializedQuizList = await this.filterAndPaginate(quizzes, {
            count: params.count,
            page: params.page,
            filter: {
                author: { operator: 'equal', data: user.id },
                topic: { operator: 'equal', data: params.topic },
                name: { operator: 'like', data: params.name },
                mode: { operator: 'equal', data: params.mode }
            }
        });

        return serializedQuizList;
    }

    /**
     * Deleta o usuário
     */
    async deleteUser(user: Users) {
        await this.remove(user);
    }
}
