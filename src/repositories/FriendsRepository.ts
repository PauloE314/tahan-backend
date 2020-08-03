import { Repository, QueryBuilder, EntityRepository, SelectQueryBuilder, getRepository } from "typeorm";
import { Users } from "@models/User";
import { BaseRepository } from "src/utils/bases";
import { Friendships } from "@models/friends/Friendships";
import { Messages } from "@models/friends/messages";
import { IFriendsRepository } from "@controllers/friends/types";
import { Solicitations } from "@models/friends/Solicitations";

@EntityRepository(Friendships)
export class FriendsRepository extends BaseRepository<Friendships> implements IFriendsRepository {

    /**
     * Retorna todas as amizades do usuário passado como parâmetro
     */
    // TODO
    findFriendships = (user: Users): SelectQueryBuilder<Friendships> => {
        const { id } = user;

        return this.createQueryBuilder('friendship')
            .leftJoinAndSelect('friendship.users', 'users')
    }

    /**
     * Retorna as solicitações de amizade que envolvam o usuário passado como parâmetro. Permite o filtro por meio de type: 'all' | 'sended' | 'received'
     */
    findSolicitations = (user: Users, type: string): SelectQueryBuilder<Solicitations> => {
        const { id } = user;

        // Query base
        const base_query = this.solicitationsRepo.createQueryBuilder('solicitation')

        // Apenas as solicitações enviadas
        if (type === 'sended') 
            base_query
                .loadRelationIdAndMap('solicitation.sender', 'solicitation.sender')
                .leftJoinAndSelect('solicitation.receiver', 'receiver')
                .where('solicitation.sender.id = :id', { id });

        // Apenas as solicitações recebidas
        else if (type === 'received')
            base_query
                .loadRelationIdAndMap('solicitation.receiver', 'solicitation.receiver')
                .leftJoinAndSelect('solicitation.sender', 'sender')
                .where('solicitation.receiver.id = :id', { id });

        // Todas as solicitações que envolvem o usuário
        else
            base_query
                .leftJoinAndSelect('solicitation.receiver', 'receiver')
                .leftJoinAndSelect('solicitation.sender', 'sender')
                .where('sender.id = :id', { id })
                .orWhere('receiver.id = :id', { id })

        
        return base_query;
    }

    /**
     * Envia uma solicitação de amizade 
     */
    async sendSolicitation (sender: Users, receiver: Users): Promise<Solicitations> {
        // Cria a solicitação
        const solicitation = new Solicitations();
        solicitation.sender = sender;
        solicitation.receiver = receiver;
        const saved = await this.solicitationsRepo.save(solicitation);

        return saved;
    }

    /**
     * Aceita uma solicitação de amizade e retorna uma amizade fixa
     */
    async acceptSolicitation (receiver: Users, solicitation: Solicitations): Promise<Friendships> {
        // Pega o usuário
        const { sender } = solicitation;
        // Deleta a solicitação
        await this.solicitationsRepo.remove(solicitation);
        // Cria a amizade
        const friendship = new Friendships();
        friendship.users = [receiver, sender];
        const saved = await this.save(friendship);

        return saved;
    }

    // async sendMessage (user: Users, friendship: any): Promise<Messages> {

    // }
    get usersRepo() {
        return getRepository(Users);
    }

    get solicitationsRepo() {
        return getRepository(Solicitations);
    }
}