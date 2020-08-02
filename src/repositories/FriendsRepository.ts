import { Repository, QueryBuilder, EntityRepository, SelectQueryBuilder } from "typeorm";
import { Users } from "@models/User";
import { BaseRepository } from "src/utils/bases";
import { Friendships } from "@models/friends/Friendships";
import { Messages } from "@models/friends/messages";

@EntityRepository(Friendships)
export class FriendsRepository extends BaseRepository<Friendships> {

    /**
     * Retorna todas as amizades do usuário passado como parâmetro
     */
    findFriendships = (user: Users): SelectQueryBuilder<Friendships> => {
        const { id } = user;

        return this.createQueryBuilder('friendship')
            .loadRelationIdAndMap('friendship.sender', 'friendship.sender')
            .loadRelationIdAndMap('friendship.receiver', 'friendship.receiver')
            .where('friendship.sender.id = :id', { id })
            .orWhere('friendship.receiver.id = :id', { id })
    }

    // async createFriendship (sender: Users, receiver_id: any): Promise<Friendships> {

    // }

    // async acceptFriendship (receiver: Users, friendship: Friendships): Promise<Friendships> {

    // }

    // async sendMessage (user: Users, friendship: any): Promise<Messages> {

    // }
}