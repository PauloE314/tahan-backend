import { EntityRepository, SelectQueryBuilder, getRepository } from "typeorm";
import { Users } from "@models/User";
import { BaseRepository } from "src/utils/bases";
import { Friendships } from "@models/friends/Friendships";
import { IFriendsRepository } from "@controllers/friends/friendsTypes";
import { Solicitations } from "@models/friends/Solicitations";
import { Messages } from "@models/friends/messages";

@EntityRepository(Friendships)
export class FriendsRepository extends BaseRepository<Friendships> implements IFriendsRepository {

    /**
     * Retorna todas as amizades do usuário passado como parâmetro
     */
    async findFriendships (user: Users, params: any) {
        const { id } = user;

        const queryBuilder = this.createQueryBuilder('friendship')
            .leftJoin('friendship.user_1', 'user1')
            .leftJoin('friendship.user_2', 'user2')
            .where('user1.id = :id', { id })
            .orWhere('user2.id = :id', { id })
            .select([
                'friendship',
                'user1.id', 'user1.username', 'user1.image_url',
                'user2.id', 'user2.username', 'user2.image_url',
            ])

        const friendPaginated = await this.paginate(queryBuilder, {
            count: params.count,
            page: params.page
        });

        return friendPaginated;
    }

    /**
     * Retorna as solicitações de amizade que envolvam o usuário passado como parâmetro. Permite o filtro por meio de type: 'all' | 'sended' | 'received'
     */
    async findSolicitations (user: Users, type: string, params: any) {
        const { id } = user;

        // Query base
        const base_query = getRepository(Solicitations)
            .createQueryBuilder('solicitation')
            .select(['solicitation'])

        // Apenas as solicitações enviadas
        if (type === 'sended') 
            base_query
                .loadRelationIdAndMap('solicitation.sender', 'solicitation.sender')
                .leftJoinAndSelect('solicitation.receiver', 'receiver')
                .where('solicitation.sender.id = :id', { id })
                .addSelect(['receiver.id', 'receiver.username'])


        // Apenas as solicitações recebidas
        else if (type === 'received')
            base_query
                .loadRelationIdAndMap('solicitation.receiver', 'solicitation.receiver')
                .leftJoin('solicitation.sender', 'sender')
                .where('solicitation.receiver.id = :id', { id })
                .addSelect(['sender.id', 'sender.username'])

        // Todas as solicitações que envolvem o usuário
        else
            base_query
                .leftJoin('solicitation.receiver', 'receiver')
                .leftJoin('solicitation.sender', 'sender')
                .where('sender.id = :id', { id })
                .orWhere('receiver.id = :id', { id })
                .addSelect(['receiver.id', 'receiver.username'])
                .addSelect(['sender.id', 'sender.username'])


        const paginated = await this.paginate(base_query, {
            count: params.count,
            page: params.page
        })

        return paginated;
    }

    /**
     * Retorna todos os dados de uma amizade 
     */
    async findFullFriendship (friendshipId: number, params: any) {
        const friendship = await this.createQueryBuilder('friends')
            .leftJoinAndSelect('friends.user_1', 'user1')
            .leftJoinAndSelect('friends.user_2', 'user2')
            .leftJoinAndSelect('friends.messages', 'messages')
            .where('friends.id = :id', { id: friendshipId })
            .getOne();

        return friendship;
    }


    /**
     * Envia uma solicitação de amizade 
     */
    async sendSolicitation (sender: Users, receiver: Users): Promise<Solicitations> {
        // Cria a solicitação
        const solicitation = new Solicitations();
        solicitation.sender = sender;
        solicitation.receiver = receiver;
        const saved = await getRepository(Solicitations).save(solicitation);

        return saved;
    }

    /**
     * Aceita uma solicitação de amizade e retorna uma amizade fixa
     */
    async acceptSolicitation (solicitation: Solicitations): Promise<Friendships> {
        // Pega o usuário
        const { sender, receiver } = solicitation;
        // Aceitação
        solicitation.answer = 'accept';
        await getRepository(Solicitations).save(solicitation);
        // Cria a amizade
        const friendship = new Friendships();
        friendship.user_1 = sender;
        friendship.user_2 = receiver;

        const saved = await this.save(friendship);

        return saved;
    }

    
    /**
     * Nega uma solicitação de amizade
     */
    async denySolicitation (solicitation: Solicitations) {
        // Negação
        solicitation.answer = "deny";
        await getRepository(Solicitations).save(solicitation);
    }


    /**
     * Permite acabar com uma amizade
     */
    async deleteFriendship(friendship: Friendships) {
        await this.remove(friendship);
    }

    /**
     * Permite apagar uma solicitação de amizade
     */
    async deleteSolicitation(solicitation: Solicitations) {
        await getRepository(Solicitations).remove(solicitation);
    }


    /**
     * Permite enviar uma mensagem simples para seu amigo 
     */
    async sendMessage (user: Users, friendship: Friendships, message: string): Promise<Messages> {
        console.log(user);
        const newMessage = new Messages();
        newMessage.sender = user;
        newMessage.friendship = friendship;
        newMessage.message = message;

        const saved = await getRepository(Messages).save(newMessage);

        return saved;
    }

}