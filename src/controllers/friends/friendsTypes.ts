import { Users } from "@models/User";
import { BaseRepository, IPaginatedData } from "src/utils/bases";
import { Friendships } from "@models/friends/Friendships";
import { Solicitations } from "@models/friends/Solicitations";


/**
 * Interface do repositório dos amigos
 */
export interface IFriendsRepository extends BaseRepository<Friendships> {
    findSolicitations: (user: Users, params: any) => Promise<IPaginatedData<Solicitations>>,
    createSolicitation: (sender: Users, receiver: Users) => Promise<Solicitations>,
    answerSolicitation: (data: { solicitation: Solicitations, answer: 'deny' | 'accept'}) => Promise<Solicitations>,
    deleteSolicitation: (solicitation: Solicitations) => Promise<void>

    findFriendships: (user: Users, params: any) => Promise<IPaginatedData<Friendships>>,
    createFriendship: (users: [Users, Users]) => Promise<Friendships>
    deleteFriendship: (friendship: Friendships) => Promise<void>

}

/**
 * Interface do validator das rotas dos amigos
 */
export interface IFriendsValidator {

    sendSolicitationValidator: (sender: Users, receiver: Users) => Promise<{ receiver: Users, sender: Users }>,
    answerSolicitationValidator: (data: { user: Users, solicitation: Solicitations, action: any}) => { solicitation: Solicitations, action: 'accept' | 'deny' },
    deleteSolicitationValidator: (data: { user: Users, solicitation: Solicitations }) => Promise<{ solicitation: Solicitations }>,

    sendMessageValidator: (data: { message: any }) => { message: string },

    isInFriendship: (data: { user: Users, friendship: Friendships }) => { user: Users, friendship: Friendships }
}