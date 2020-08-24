import { EntityRepository } from "typeorm";
import { Solicitations } from "@models/friends/Solicitations";
import { BaseRepository } from "src/utils/baseRepository";
import { Users } from "@models/User";

@EntityRepository(Solicitations)
export class SolicitationsRepository extends BaseRepository<Solicitations> {
    
    /**
     * Retorna as solicitações de amizade que envolvam o usuário passado como parâmetro.
     */
    async findSolicitations (user: Users, params: any) {
        const { id } = user;

        // Query base
        const base_query = this
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
    async createSolicitation (sender: Users, receiver: Users) {
        // Cria a solicitação
        const solicitation = new Solicitations();
        solicitation.sender = sender;
        solicitation.receiver = receiver;

        return await this.save(solicitation)
    }
        
    /**
     * Response uma solicitação de amizade
     */
    async answerSolicitation (data: { solicitation: Solicitations, answer: 'deny' | 'accept' }) {
        data.solicitation.answer = data.answer
        return await this.save(data.solicitation);
    }
    
    /**
     * Permite apagar uma solicitação de amizade
     */
    async deleteSolicitation(solicitation: Solicitations) {
        await this.remove(solicitation);
    }

}