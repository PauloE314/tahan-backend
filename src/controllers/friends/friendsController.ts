import { IFriendsController, IFriendsValidator, IFriendsRepository } from './friendsTypes';
import { APIRequest } from 'src/@types';
import { Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';
import { APIRoute } from 'src/utils';


/**
 * Controlador de ações para amigos
 */
export class FriendsController implements IFriendsController {
    
    constructor(
        private repository: new() => IFriendsRepository,
        private validator: IFriendsValidator
    ) { }

    /**
     * **web: /friends/ - GET**
     * 
     * Lista os amigos do usuário logado. Permite o filtro de pesquisa por paginação.
     */
    // @APIRoute
    @APIRoute
    async listFriends(request: APIRequest, response: Response, next: NextFunction) {
        const user = request.user.info;
        const params = request.query;
        
        // Pega lista de amigos
        const friends = await this.repo.findFriendships(user, params);

        const { data, ...paginatedData } = friends;
        // Serialização dos dados do
        const friendsData = data.map(friend => ({
            id: friend.id,
            users: [friend.user_1, friend.user_2],
            accepted_at: friend.accepted_at,
        }));

        const serializedFriendData = { ...paginatedData, data: friendsData };
        
        return response.send(serializedFriendData);
    }

    /**
     * **web: /friends/:friendshipId - GET**
     * 
     * Retorna os dados de uma amizade.
     */
    // @APIRoute
    @APIRoute
    async readFriendship(request: APIRequest, response: Response, next: NextFunction) {
        const user = request.user.info;
        const { friendshipId } = request.params;
        const params = request.query;
        
        await this.validator.findFriendshipValidator(user, friendshipId);
        const friendship = await this.repo.findFullFriendship(Number(friendshipId), params);

        return response.send(friendship);
    }

    /**
     * **web: /friends/<sended | received | all> - GET**
     * 
     * Lista as solicitações do usuário logado. Permite o filtro de pesquisa por paginação.
     */
    // @APIRoute
    @APIRoute
    async listSolicitations(request: APIRequest, response: Response, next: NextFunction) {
        const user = request.user.info;
        const type = request.params.type;
        const params = request.query;

        // Pega lista de solicitações
        const solicitations = await this.repo.findSolicitations(user, type, params);
        
        return response.send(solicitations);
        
    }

    /**
     * **web: /friends/send/ - POST**
     * 
     * Permite enviar uma solicitação amizade. Retorna erro caso a a amizade já exista.
     */
    @APIRoute
    async sendSolicitation(request: APIRequest, response: Response) {
        const requestSender = request.user.info;
        const { user } = request.body;
        
        // Valida dados
        const { sender, receiver } = await this.validator.sendSolicitationValidator(requestSender, user);

        // Cria a amizade
        const new_friendship = await this.repo.sendSolicitation(sender, receiver);

        // Retorna os dados da amizade
        return response.send(new_friendship);
    }

    /**
     * **web: /friends/:solicitationId/ - POST**
     * 
     * Permite aceitar a solicitação de amizade de alguém.
     */
    @APIRoute
    async answerSolicitation(request: APIRequest, response: Response) {
        const user = request.user.info;
        const { solicitationId } = request.params;
        const { action } = request.body;

        // Valida a operação
        const solicitation = await this.validator.answerSolicitationValidator(user, solicitationId, action);

        // Aceita a amizade
        if (action === 'accept') {
            const resp = await this.repo.acceptSolicitation(solicitation);
            return response.send(resp);

        }
        else {
            await this.repo.denySolicitation(solicitation);
            return response.send({ message: "Solicitação negada com sucesso" });
        }
    }
    
    /**
     * **web: /friends/:friendshipId - DELETE**
     * 
     * Acaba com uma amizade consolidada.
     */
    @APIRoute
    async deleteFriendship(request: APIRequest, response: Response) {
        const user = request.user.info;
        const { friendshipId } = request.params;

        // Valida a operação
        const friendship = await this.validator.deleteValidator(user, friendshipId);

        // Desfaz a amizade
        await this.repo.deleteFriendship(friendship);

        return response.send({ message: 'Amizade desfeita com sucesso' });
    }

    /**
     * **web: /solicitation/:solicitationId - DELETE**
     * 
     * Remove uma solicitação de amizade.
     */
    @APIRoute
    async deleteSolicitation(request: APIRequest, response: Response) {
        const user = request.user.info;
        const { solicitationId } = request.params;

        // Valida a operação
        const solicitation = await this.validator.deleteSolicitationValidator(user, solicitationId);

        await this.repo.deleteSolicitation(solicitation);

        return response.send({ message: 'Solicitação deletada com sucesso' });
    }

    
    
    /**
     * **web: /friends/:friendshipId/send-message - POST**
     * 
     * Permite o envio de mensagem para amigo. Os dados de envio devem ser:
     * 
     * - message: string
     */
    @APIRoute
    async sendMessage(request: APIRequest, response: Response) {
        const user = request.user.info;
        const { friendshipId } = request.params;
        const { message } = request.body;

        const validatedData = await this.validator.sendMessageValidator(user, friendshipId, message);
        
        const newMessage = await this.repo.sendMessage(user, validatedData.friendship, validatedData.message);
        return response.send(newMessage);
    }


    get repo() {
        return getCustomRepository(this.repository);
    }
}