import { IFriendsValidator, IFriendsRepository } from './friendsTypes';
import { APIRequest } from 'src/@types';
import { Response, NextFunction } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import { APIRoute } from 'src/utils';
import UserValidator from '@controllers/users/usersValidator';
import { FriendsRepository } from './friendsRepository';
import { FriendsValidator } from './friendsValidator';
import { Solicitations } from '@models/friends/Solicitations';
import { codes } from '@config/server';


/**
 * Controlador de ações para amigos
 */
export class FriendsController {
    userValidator = new UserValidator();

    constructor(
        private repository: new() => IFriendsRepository,
        private validator: IFriendsValidator
    ) { }

    /**
     * **web: /friends/<sended | received | all> - GET**
     * 
     * Lista as solicitações do usuário logado. Permite o filtro de pesquisa por paginação e answer.
     * 
     * - answer: 'accept' | 'deny' | 'null'
     */
    // @APIRoute
    @APIRoute
    async listSolicitations(request: APIRequest, response: Response, next: NextFunction) {
        const user = request.user.info;
        const params = request.query;

        params.answer = params.answer === 'null' ? null: params.answer;
        // Pega lista de solicitações
        const solicitations = await this.repo.findSolicitations(user, params);
        
        return response.send(solicitations);
    }

    /**
     * **web: /friends/send/ - POST**
     * 
     * Permite enviar uma solicitação amizade. Retorna erro caso a a amizade já exista.
     */
    @APIRoute
    async sendSolicitation(request: APIRequest, response: Response) {
        const sender = request.user.info;
        const { user } = request.body;
        
        // Certifica que o alvo existe
        const receiver = await this.userValidator.getUser(user);

        // Certifica que os usuários já não são amigos ou se existe outra solicitação
        await this.validator.sendSolicitationValidator(sender, receiver);

        // Envia a solicitação
        const newSolicitation = await this.repo.createSolicitation(sender, receiver);

        // Retorna os dados da amizade
        return response.status(codes.CREATED).send(newSolicitation);
    }

    /**
     * **web: /friends/:solicitationId/ - POST**
     * 
     * Permite aceitar a solicitação de amizade de alguém.
     */
    @APIRoute
    async answerSolicitation(request: APIRequest, response: Response) {
        const user = request.user.info;
        const { solicitation } = request;
        const { action } = request.body;

        // Valida a operação
        this.validator.answerSolicitationValidator({ user, solicitation, action });

        // Aceita a amizade
        if (action === 'accept') {
            // Aceita a solicitação
            await this.repo.answerSolicitation({ solicitation, answer: 'accept'});

            // Cria nova amizade
            const friendship = await this.repo.createFriendship(
                [solicitation.sender, solicitation.receiver]
            );

            const serializedFriendship = {
                id: friendship.id,
                users: [friendship.user_1, friendship.user_2],
                accepted_at: friendship.accepted_at
            }
            return response.send(serializedFriendship);

        }
        // Nega solicitação
        else {
            await this.repo.answerSolicitation({ solicitation, answer: 'deny'});

            return response.send({ message: "Solicitação negada com sucesso" });
        }
    }
    
    /**
     * **web: /solicitation/:solicitationId - DELETE**
     * 
     * Remove uma solicitação de amizade.
     */
    @APIRoute
    async deleteSolicitation(request: APIRequest, response: Response) {
        const user = request.user.info;
        const { solicitation } = request;

        // Valida a operação
        await this.validator.deleteSolicitationValidator({ user, solicitation });

        // Deleta a solicitação
        await this.repo.deleteSolicitation(solicitation);

        return response.send({ message: 'Solicitação deletada com sucesso' });
    }

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
        // Serialização dos dados
        const friendsData = data.map(friend => ({
            id: friend.id,
            users: [friend.user_1, friend.user_2],
            accepted_at: friend.accepted_at,
        }));

        const serializedFriendData = { ...paginatedData, data: friendsData };
        
        return response.send(serializedFriendData);
    }

    /**
     * **web: /friends/:friendshipId - DELETE**
     * 
     * Acaba com uma amizade consolidada.
     */
    @APIRoute
    async deleteFriendship(request: APIRequest, response: Response) {
        const user = request.user.info;
        const { friendship } = request;

        // Certifica que usuário está na amizade
        this.validator.isInFriendship({ user, friendship });
        // Desfaz a amizade
        await this.repo.deleteFriendship(friendship);

        return response.send({ message: 'Amizade desfeita com sucesso' });
    }


    get repo() {
        return getCustomRepository(this.repository);
    }
}