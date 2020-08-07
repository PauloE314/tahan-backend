import { Repository, QueryBuilder, EntityRepository, SelectQueryBuilder, getRepository } from "typeorm";
import { Users } from "@models/User";
import { BaseRepository } from "src/utils/bases";
import { IUsersRepository } from "@controllers/users/usersTypes";
import { google_data } from "src/@types";
import jwt from 'jsonwebtoken';



@EntityRepository(Users)
export class UsersRepository extends BaseRepository<Users> implements IUsersRepository {

    /**
     * Cria ou atualiza um usuário
     */
    async createOrUpdate(data: google_data, occupation: 'teacher' | 'student') {
        // Tenta pegar o usuário
        const oldUser = await this.createQueryBuilder('user')
            .where('googleID = :id', { id: data.id })
            .getOne();

        const user = oldUser || new Users;
        // Atualiza dados do usuário
        user.email = data.email;
        user.image_url = data.image_url;
        user.username = data.name;
        user.googleID = data.id;
        // Seta a ocupação apenas uma vez
        if (!oldUser)
            user.occupation = occupation;

        // Normatiza dados
        delete user.googleID;
        // Retorna user
        return user;
    }

    /**
     * Cria um token para login (JWT)
     */
    createLoginToken(id: number, secret_key: string, expireTime: any) {
        const login_token = jwt.sign({ id }, secret_key, { expiresIn: expireTime });
        return login_token;
    }
   
}