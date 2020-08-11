import { APIRequest, IApiResponse } from "src/@types";
import { Response, NextFunction } from "express";
import { Users } from "@models/User";
import { SelectQueryBuilder } from "typeorm";
import { BaseRepository, IPaginatedData } from "src/utils/bases";
import { Friendships } from "@models/friends/Friendships";
import { Solicitations } from "@models/friends/Solicitations";
import { Messages } from "@models/friends/messages";


/**
 * Interface do controlador de rotas dos amigos
 */
export interface IFriendsController {
    listFriends: IApiResponse,
    readFriendship: IApiResponse,
    listSolicitations: IApiResponse,
    sendSolicitation: IApiResponse,
    answerSolicitation: IApiResponse,
    deleteFriendship: IApiResponse,
    deleteSolicitation: IApiResponse,
    sendMessage: IApiResponse,
    
}


/**
 * Interface do repositório dos amigos
 */
export interface IFriendsRepository extends BaseRepository<Friendships> {
    findFriendships: (user: Users, params: any) => Promise<IPaginatedData<Friendships>>,
    findFullFriendship: (friendshipId: number, params: any) => Promise<IFullFriendship>,
    deleteFriendship: (friendship: Friendships) => Promise<void>

    findSolicitations: (user: Users, type: string, params: any) => Promise<IPaginatedData<Solicitations>>,
    sendSolicitation: (sender: Users, receiver: Users) => Promise<Solicitations>,
    acceptSolicitation: (solicitation: Solicitations) => Promise<Friendships>,
    denySolicitation: (solicitation: Solicitations) => Promise<void>,
    deleteSolicitation: (solicitation: Solicitations) => Promise<void>

    sendMessage: (user: Users, friendship: Friendships, message: string) => Promise<Messages>,
}

/**
 * Interface do validator das rotas dos amigos
 */
export interface IFriendsValidator {
    findFriendshipValidator: (user: Users, friendshipId: any) => Promise<any>,

    sendSolicitationValidator: (sender: Users, receiver_id: any) => Promise<ISendSolicitation>,
    answerSolicitationValidator: (receiver: Users, solicitationId: any, action: any ) => Promise<Solicitations>,
    deleteSolicitationValidator: (user: Users, solicitationId: any) => Promise<Solicitations>,

    deleteValidator: (user: Users, friendshipId: any) => Promise<Friendships>,

    sendMessageValidator: (user: Users, friendshipId: any, message: any) => Promise<{
        friendship: Friendships,
        message: string
    }>
}


interface ISendSolicitation {
    receiver: Users,
    sender: Users;
}

interface IFullFriendship extends Friendships {

}