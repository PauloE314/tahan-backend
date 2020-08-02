import { IFriendsValidator } from './types';
import { Users } from '@models/User';
import { Friendships } from '@models/friends/Friendships';


export class FriendsValidator implements IFriendsValidator {

    async createValidator (sender: Users, receiver_id: any): Promise<void> {

    }

    async acceptValidator (receiver: Users, friendship: any): Promise<any> {

    }
    
    async deleteValidator (user: Users, friendship: any): Promise<void> {
        
    }

    async sendValidator (user: Users, friendship: Friendships, text: string): Promise<void> {

    }
}