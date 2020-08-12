import { IFriendsValidator, IFriendsRepository } from './friendsTypes';
import { Users } from '@models/User';
import { Friendships } from '@models/friends/Friendships';
import { getRepository } from 'typeorm';
import { ValidationError } from 'src/utils';
import { Solicitations } from '@models/friends/Solicitations';
import { BaseValidator } from 'src/utils/validators';


export class FriendsValidator extends BaseValidator implements IFriendsValidator  {

    /**
     * Valida o envio de solicitação de amizade 
     */
    async sendSolicitationValidator (sender: Users, receiver: Users) {

        // Checa se o id é inválido
        if (receiver.id === sender.id)
            throw new ValidationError({ receiver: 'Usuário inválido' });
        
        // Checa se ambos já são amigos
        const alreadyFriends = await getRepository(Friendships).findOne({
            where: [
                { user_1: sender.id, user_2: receiver.id },
                { user_1: receiver.id, user_2: sender.id }
            ]
        });
        
        if (alreadyFriends)
            this.RaiseError('Os usuários já são amigos');
        
        // Checa se há uma solicitação com o mesmo objetivo
        const same_message = await getRepository(Solicitations).findOne({ 
            where: [
                { sender: sender.id, receiver: receiver.id, answer: null },
                { receiver: sender.id, sender: receiver.id, answer: null },
            ]
        });
        
        if (same_message)
            this.RaiseError("Já existe outra solicitação com o mesmo objetivo");
        
        // Retorna dados
        return {
            sender,
            receiver
        }
    }
    
    /**
     * Valida a resposta de uma solicitação de amizade
     */
    answerSolicitationValidator (data: { user: Users, solicitation: Solicitations, action: any}) {
        const { user, solicitation, action } = data;

        if (solicitation.answer !== null)
            this.RaiseError("A solicitação já foi respondida");
            
        // Certifica que aquele que responde é o destinatário
        if (solicitation.receiver.id !== user.id)
            this.RaiseError("O usuário não pode realizar essa ação", 401);
        
        // Certifica que a solicitação já não foi respondida
        if (solicitation.answer)
            this.RaiseError("Essa solicitação já foi respondida");
        
        if (action !== 'accept' && action !== 'deny')
            this.RaiseError("Ação inválida, esperado 'accept' ou 'deny', recebido: " + action);
        
        return {
            solicitation,
            action
        };
    }
    
    /**
     * Valida a destruição de uma solicitação de amizade
     */
    async deleteSolicitationValidator(data: { user: Users, solicitation: Solicitations }) {
        const { user, solicitation } = data;

        // Checa se o usuário pode realizar a ação
        if (solicitation.sender.id !== user.id)
            this.RaiseError("Permissão negada; apenas aquele que enviou a solicitação pode apagá-la", 401);

        // Certifica que ela ainda não foi respondida
        if (solicitation.answer)
            this.RaiseError("A solicitação já foi respondida");

        return {
            solicitation
        };
    } 
    

    sendMessageValidator (data: { message: any }) {
        const { message } = data;
        // Certifica que o texto é uma string
        if (typeof message !== 'string')
            this.RaiseError("Envie uma mensagem válido");

        return {
            message
        }
    }


    /**
     * Checa se usuário faz parte de amizade
     */
    isInFriendship(data: { user: Users, friendship: Friendships }) {
        const { user, friendship } = data;

         if (friendship.user_1.id !== user.id && friendship.user_2.id !== user.id)
            this.RaiseError("O usuário não faz parte da amizade", 401);

        return {
            user,
            friendship
        }
    }
}