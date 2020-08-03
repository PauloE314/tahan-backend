import { IFriendsValidator, IFriendsRepository } from './types';
import { Users } from '@models/User';
import { Friendships } from '@models/friends/Friendships';
import { getRepository } from 'typeorm';
import { ValidationError } from 'src/utils';


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