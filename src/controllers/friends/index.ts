import { IFriendsController, IFriendsValidator, IFriendsRepository } from './types';
import { APIRequest } from 'src/@types';
import { Response, NextFunction } from 'express';
// import { SafeMethod } from 'src/utils';
import { getCustomRepository } from 'typeorm';
import { Friendships } from '@models/friends/Friendships';
import { nextTick } from 'process';
import { SafeMethod } from 'src/utils';
import { FriendsRepository } from 'src/repositories/FriendsRepository';



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
    // @SafeMethod
    @SafeMethod
    async list_friends(request: APIRequest, response: Response, next: NextFunction) {
        const user = request.user.info;
        const query = request.query;
        
        // Pega lista de amigos
        const friends = this.repo.findFriendships(user);

        // Aplica filtros e paginação
        const data = await this.repo.filterAndPaginate(friends, query);
        
        return response.send(data);
        
    }

    /**
     * **web: /friends/<sended | received | all> - GET**
     * 
     * Lista as solicitações do usuário logado. Permite o filtro de pesquisa por paginação.
     */
    // @SafeMethod
    @SafeMethod
    async list_solicitations(request: APIRequest, response: Response, next: NextFunction) {
        const user = request.user.info;
        const type = request.params.type;
        const { query } = request;

        // Pega lista de solicitações
        const solicitations = this.repo.findSolicitations(user, type);
        // Aplica filtros e paginação
        const data = await this.repo.filterAndPaginate(solicitations, query);
        
        return response.send(data);
        
    }

    /**
     * **web: /friends/:user_id - POST**
     * 
     * Permite enviar uma solicitação amizade. Retorna erro caso a a amizade já exista.
     */
    @SafeMethod
    async send_solicitation(request: APIRequest, response: Response) {
        const  user = request.user.info;
        const { user_id } = request.params;
        
        // Valida dados
        const { sender, receiver } = await this.validator.sendSolicitationValidator(user, user_id);

        // Cria a amizade
        const new_friendship = await this.repo.sendSolicitation(sender, receiver);

        // Retorna os dados da amizade
        return response.send(new_friendship);
    }

    /**
     * **web: /friends/:friendship_id - POST**
     * 
     * Permite aceitar a solicitação de amizade de alguém.
     */
    // async accept(request: APIRequest, response: Response) {
    //     const user = request.user.info;
    //     const { friendship } = request;

    //     // Valida a operação
    //     await this.validator.acceptValidator(user, friendship);

    //     // Aceita a amizade
    //     const data = await this.repository.acceptFriendship(user, friendship);
        
    //     return response.send(data);
    // }
    
    /**
     * **web: /friends/:friendship_id - DELETE**
     * 
     * Lista os amigos do usuário logado. Permite o filtro de pesquisa por paginação
     */
    // async delete(request: APIRequest, response: Response) {
    //     const user = request.user.info;
    //     const { friendship } = request;

    //     // Valida a operação
    //     await this.validator.deleteValidator(user, friendship);

    //     // Desfaz a amizade
    //     await this.repository.delete(friendship);

    //     return response.send({ message: 'Amizade desfeita com sucesso' });
    // }

    
    
    /**
     * **web: /friends/:friendship_id - POST**
     * 
     * Permite o envio de mensagem para amigo. Os dados de envio devem ser:
     * 
     * - message: string
     */
    // async message(request: APIRequest, response: Response) {

    //     return response.send({ message: 'Não implementado ainda' });
    // }
    get repo() {
        return getCustomRepository(this.repository);
    }
}