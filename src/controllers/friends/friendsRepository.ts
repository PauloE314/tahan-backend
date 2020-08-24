import { EntityRepository, getRepository } from "typeorm";

import { Users } from "@models/User";
import { BaseRepository } from "src/utils/baseRepository";
import { Friendships } from "@models/friends/Friendships";
import { Solicitations } from "@models/friends/Solicitations";


@EntityRepository(Friendships)
export class FriendsRepository extends BaseRepository<Friendships> {

    /**
     * Retorna todas as amizades do usuário passado como parâmetro com paginação e filtro
     */
    async findFriendships (user: Users, params: any) {
        const { id } = user;
        const { username } = params;

        const queryBuilder = this.createQueryBuilder('friendship')
            .leftJoin('friendship.user_1', 'user1')
            .leftJoin('friendship.user_2', 'user2')
            .select([
                'friendship',
                'user1.id', 'user1.username', 'user1.image_url',
                'user2.id', 'user2.username', 'user2.image_url',
            ]);

        if (username) {
            queryBuilder
                .where(
                    'user1.id = :id AND user2.username LIKE :username',
                    { id, username: `%${username}%` }
                )
                .orWhere(
                    'user2.id = :id AND user1.username LIKE :username',
                    { id, username: `%${username}%` }
                )
        }  
        else {
            queryBuilder
                .where('user1.id = :id', { id })
                .orWhere('user2.id = :id', { id })
        }

        const friendPaginated = await this.paginate(queryBuilder, {
            count: params.count,
            page: params.page
        });

        return friendPaginated;
    }

    /**
     * Retorna as amizades cruas do usuário
     */
    async findRawFriendships(user: Users) {
        const { id } = user;

        const friendList = this.createQueryBuilder('friendship')
            .leftJoin('friendship.user_1', 'user1')
            .leftJoin('friendship.user_2', 'user2')
            .select([
                'friendship',
                'user1.id', 'user1.username', 'user1.image_url',
                'user2.id', 'user2.username', 'user2.image_url',
            ])
            .where('user1.id = :id', { id })
            .orWhere('user2.id = :id', { id })
            .getMany();

        return friendList;
    }

    /**
     * Cria uma nova amizade
     */
    async createFriendship(data: [Users, Users]) {
        const friendship = new Friendships();
        friendship.user_1 = data[0];
        friendship.user_2 = data[1];

        return await this.save(friendship)
    }

    /**
     * Permite acabar com uma amizade
     */
    async deleteFriendship(friendship: Friendships) {
        await this.remove(friendship);
    }

    /**
     * Checa se dois usuários são amigos
     */
    async areFriends(users: [Users, Users]) {
        const [user1, user2] = users;

        const friendship = this.createQueryBuilder('friendship')
            .leftJoin('friendship.user_1', 'user1')
            .leftJoin('friendship.user_2', 'user2')
            .where('user1.id = :user1Id AND user2.id = :user2Id', { user1Id: user1.id, user2Id: user2.id })
            .orWhere('user1.id = :user1Id AND user2.id = :user2Id', { user1Id: user2.id, user2Id: user1.id })
            .select([
                'friendship',
                'user1.id', 'user1.username', 'user1.image_url',
                'user2.id', 'user2.username', 'user2.image_url',
            ])
            .getOne();

        return friendship ? friendship : false;
    }
}