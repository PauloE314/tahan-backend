import { EntityRepository, getRepository } from "typeorm";
import { Users } from "@models/User";
import { BaseRepository } from "src/utils/bases";
import { Friendships } from "@models/friends/Friendships";
import { IFriendsRepository } from "@controllers/friends/friendsTypes";
import { Solicitations } from "@models/friends/Solicitations";

@EntityRepository(Friendships)
export class FriendsRepository extends BaseRepository<Friendships> implements IFriendsRepository {

    /**
     * Retorna as solicitações de amizade que envolvam o usuário passado como parâmetro.
     */
    async findSolicitations (user: Users, params: any) {
        const { id } = user;

        // Query base
        const base_query = getRepository(Solicitations)
            .createQueryBuilder('solicitation')
            .leftJoin('solicitation.sender', 'sender')
            .leftJoin('solicitation.receiver', 'receiver')
            .select([
                'solicitation',
                'sender.id', 'sender.username', 'sender.image_url',
                'receiver.id', 'receiver.username', 'receiver.image_url'
            ]);

        // Somente as enviadas
        if (params.type === 'sended') 
            base_query.where('sender.id = :id', { id });
        
        // Somente as recebidas
        else if (params.type === 'received')
            base_query.where('receiver.id = :id', { id })

        // Todas
        else
            base_query.where('sender.id = :id', { id }).orWhere('sender.id = :id', { id })

        
        // Serialização de filtro de resposta
        const answerFilter: any = params.answer == null ? 
            { operator: 'is', data: params.answer }:
            { operator: 'equal', data: params.answer }


        // Aplica paginação
        const paginated = await this.filterAndPaginate(base_query, {
            count: params.count,
            page: params.page,
            filter: {
                answer: answerFilter
            }
        })

        return paginated;
    }


    /**
     * Envia uma solicitação de amizade 
     */
    async createSolicitation (sender: Users, receiver: Users): Promise<Solicitations> {
        // Cria a solicitação
        const solicitation = new Solicitations();
        solicitation.sender = sender;
        solicitation.receiver = receiver;
        const saved = await getRepository(Solicitations).save(solicitation);

        return saved;
    }
        
    /**
     * Response uma solicitação de amizade
     */
    async answerSolicitation (data: { solicitation: Solicitations, answer: 'deny' | 'accept' }) {
        data.solicitation.answer = data.answer
        return await getRepository(Solicitations).save(data.solicitation);
    }
    
    /**
     * Permite apagar uma solicitação de amizade
     */
    async deleteSolicitation(solicitation: Solicitations) {
        await getRepository(Solicitations).remove(solicitation);
    }


    /**
     * Retorna todas as amizades do usuário passado como parâmetro
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
                .where('user1.id = :id', { id, username: `%${username}%` })
                .orWhere('user2.id = :id', { id, username: `%${username}%` })
        }

        const friendPaginated = await this.paginate(queryBuilder, {
            count: params.count,
            page: params.page
        });

        return friendPaginated;
    }

    /**
     * Cria uma nova amizade
     */
    async createFriendship(data: [Users, Users]) {
        const friendship = new Friendships();
        friendship.user_1 = data[0];
        friendship.user_2 = data[1];

        const saved = await this.save(friendship);
        return saved;
    }

    /**
     * Permite acabar com uma amizade
     */
    async deleteFriendship(friendship: Friendships) {
        await this.remove(friendship);
    }
}
