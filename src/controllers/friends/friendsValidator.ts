import { IFriendsValidator, IFriendsRepository } from './friendsTypes';
import { Users } from '@models/User';
import { Friendships } from '@models/friends/Friendships';
import { getRepository } from 'typeorm';
import { ValidationError } from 'src/utils';
import { Solicitations } from '@models/friends/Solicitations';
import { BaseValidator } from 'src/utils/validators';
import { codes } from '@config/server';


export class FriendsValidator extends BaseValidator implements IFriendsValidator  {

    /**
     * Certifica que a amizade existe e inclue o usuário 
     */
    async findFriendshipValidator (user: Users, friendshipId: any) {
        const id = Number(friendshipId);

        const friendship = await getRepository(Friendships).findOne({
            relations: ['user_1', 'user_2'],
            where: { id }
        });

        if (!friendship)
            this.RaiseError("Amizade não encontrada");

        if (friendship.user_1.id !== user.id && friendship.user_2.id !== user.id)
            this.RaiseError("Permissão negada, apenas participantes da amizade podem lê-la", codes.PERMISSION_DENIED);

        return friendship
    }
    /**
     * Valida o envio de solicitação de amizade 
     */
    async sendSolicitationValidator (sender: Users, receiver: any) {
        const receiverId = Number(receiver);
        // Checa se o id é inválido
        if (receiverId === sender.id)
            throw new ValidationError({ receiver: 'Usuário inválido' });

        // Checa se ambos já são amigos
        const alreadyFriends = await getRepository(Friendships).findOne({
            where: [
                { user_1: sender.id, user_2: receiverId },
                { user_1: receiverId, user_2: sender.id }
            ]
        });


        if (alreadyFriends)
            this.RaiseError('Os usuários já são amigos');


        // Checa se há uma solicitação com o mesmo objetivo
        const same_message = await getRepository(Solicitations).findOne({ 
            where: [
                { sender: sender.id, receiver: receiverId, answer: null },
                { receiver: sender.id, sender: receiverId, answer: null },
            ]
        });

        if (same_message)
            this.RaiseError({ solicitation: "Já existe outra solicitação com o mesmo objetivo"});
        

        const receiverUser = await getRepository(Users).findOne({ where: { id: receiverId } });
        // Checa se o receiver existe
        if (!receiver)
            throw new ValidationError({ receiver: 'Usuário inexistente' });
        // Retorna dados
        return {
            sender,
            receiver: receiverUser
        }
    }

    /**
     * Valida a resposta de uma solicitação de amizade
     */
    async answerSolicitationValidator (receiver: Users, solicitationId: any, action: any) {

        const solicitation = await getRepository(Solicitations).findOne({
            relations: ['receiver', 'sender'],
            where: { id: Number(solicitationId)}
        });
        
        // Certifica que ela existe
        if (!solicitation)
            this.RaiseError("Solicitação não encontrada", 404);

        // Certifica que aquele que responde é o destinatário
        if (solicitation.receiver.id !== receiver.id)
            this.RaiseError("Ação inválida, apenas o destinatário pode responder uma solicitação de amizade");

        // Certifica que a solicitação já não foi respondida
        if (solicitation.answer)
            this.RaiseError("Essa solicitação já foi respondida");

        if (action !== 'accept' && action !== 'deny')
            this.RaiseError("Ação inválida, esperado 'accept' ou 'deny', recebido: " + action);

        return solicitation;
    }

    /**
     * Valida os dados necessários para acabar com uma amizade
     */
    async deleteValidator(user: Users, friendshipId: any) {
        // Procura amizade
        const friendship = await getRepository(Friendships).findOne({
            where: [
                { user_1: user.id, id: Number(friendshipId) },
                { user_2: user.id, id: Number(friendshipId) }
            ]
        });

        if (!friendship)
            this.RaiseError("Amizade não encontrada");


        return friendship;
    }

    /**
     * Valida a destruição de uma solicitação de amizade
     */
    async deleteSolicitationValidator(user: Users, solicitationId: any) {
        // Procura a solicitação
        const solicitation = await getRepository(Solicitations).findOne({
            where: [
                { sender: user.id, id: Number(solicitationId) },
                { receiver: user.id, id: Number(solicitationId) }
            ]
        });

        // Certifica que a solicitação existe
        if (!solicitation)
            this.RaiseError("Solicitação não encontrada");

        // Certifica que ela ainda não foi respondida
        if (solicitation.answer)
            this.RaiseError("A solicitação já foi respondida");

        return solicitation;
    } 
    

    async sendMessageValidator (user: Users, friendshipId: any, text: any) {
        // Certifica que o texto é uma string
        if (typeof text !== 'string')
            this.RaiseError("Envie um texto válido");

        // Certifica que amizade existe
        const friendship = await getRepository(Friendships).findOne({
            where: [
                { user_1: user.id, id: Number(friendshipId) },
                { user_2: user.id, id: Number(friendshipId) }
            ]
        });

        if (!friendship)
            this.RaiseError("Amizade não encontrada");

        return {
            friendship,
            message: text
        }
    }

}