import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";
import { Users } from "@models/User";
import { Repository, QueryBuilder, SelectQueryBuilder } from "typeorm";
import { BaseRepository } from "src/utils/bases";
import { Friendships } from "@models/friends/Friendships";
import { Messages } from "@models/friends/messages";


/**
 * Interface do repositório dos amigos
 */
export interface IFriendsRepository extends BaseRepository<Friendships> {
    findFriendships: (user: Users) => SelectQueryBuilder<Friendships>,
    // createFriendship: (sender: Users, receiver_id: any) => Promise<Friendships>,
    // acceptFriendship: (receiver: Users, friendship: Friendships) => Promise<Friendships>,

    // sendMessage: (user: Users, friendship: any) => Promise<Messages>,
}


/**
 * Interface do validator das rotas dos amigos
 */
export interface IFriendsValidator {
    // createValidator: (sender: Users, receiver_id: any) => Promise<void>,
    // acceptValidator: (receiver: Users, friendship: any) => Promise<Friendships>,
    // deleteValidator: (user: Users, friendship: any) => Promise<void>,
    // sendValidator: (user: Users, friendship: Friendships, text: string) => Promise<void>
}

/**
 * Interface do controlador de rotas dos amigos
 */
export interface IFriendsController {
    list: (request: APIRequest, response: Response, next?: NextFunction) => Promise<Response>,
    // create: (request: APIRequest, response: Response) => Promise<Response>,
    // accept: (request: APIRequest, response: Response) => Promise<Response>,
    // delete: (request: APIRequest, response: Response) => Promise<Response>,

    // message: (request: APIRequest, response: Response) => Promise<Response>,
}