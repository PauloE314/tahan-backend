import { IFriendsValidator, IFriendsRepository } from './friendsTypes';
import { Users } from '@models/User';
import { Friendships } from '@models/friends/Friendships';
import { getRepository } from 'typeorm';
import { ValidationError } from 'src/utils';
import { Solicitations } from '@models/friends/Solicitations';


export class FriendsValidator implements IFriendsValidator {

    constructor(
        private repository: new () => IFriendsRepository
    ) {  }

    /**
     * Valida o envio de solicitação de amizade 
     */
    async sendSolicitationValidator (sender: Users, receiver_id: any) {
        const id = Number(receiver_id);
        // Checa se o id é inválido
        if (id === sender.id)
            throw new ValidationError({ receiver: 'Usuário inválido' });

        // Checa se ambos já são amigos
        // const alreadyFriends = await getRepository(Friendships).findOne({ where: })

        // Checa se há uma solicitação com o mesmo objetivo
        const same_message = await getRepository(Solicitations).findOne({ 
            relations: ['sender', 'receiver'],
            where: [
                { sender: { id: sender.id }, receiver: { id }},
                { receiver: { id: sender.id }, sender: { id }},
            ]
        });

        if (same_message)
            throw new ValidationError({ solicitation: "Já existe outra solicitação com o mesmo objetivo"});
        
        const receiver = await getRepository(Users).findOne({ where: { id } });
        // Checa se o receiver existe
        if (!receiver)
            throw new ValidationError({ receiver: 'Usuário inexistente' });
        // Retorna dados
        return {
            sender,
            receiver
        }
    }

    async acceptValidator (receiver: Users, friendship: any): Promise<any> {

    }
    
    async deleteValidator (user: Users, friendship: any): Promise<void> {
        
    }

    async sendValidator (user: Users, friendship: Friendships, text: string): Promise<void> {

    }

    get repo() {
        return getRepository(this.repository);
    }
}