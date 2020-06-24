import { Response, NextFunction } from 'express';
import { APIRequest } from 'src/@types/global';
import { Users } from '@models/User';
import { getRepository, Like } from 'typeorm';
 
export default class UserController{    
    async list (request: APIRequest, response: Response, next: NextFunction) {
        const filter_fields = ["username", "email"]
        const query_params = request.query
        const queries = {}

        // Checa se os campos são válidos
        const valid_fields = Object.keys(query_params).filter(element => 
            filter_fields.includes(element)
        );
        
        //Põe a sintaxe de "like" do sql
        valid_fields.forEach(query => {
            queries[query] = Like("%" + query_params[query] + "%")
        })

        const userRepo = getRepository(Users);

        // Encontra os usuários e os retorna
        const user_list = await userRepo.find(queries);
        return response.send(user_list);
    }

    async create(request: APIRequest, response: Response, next: NextFunction) {
        const { username, password, email } = request.body;

        return response.send({message: "Jooj"})

    }

    async read(request: APIRequest, response: Response, next: NextFunction) {

    }

    async update(request: APIRequest, response: Response, next: NextFunction) {

    }

    async delete(request: APIRequest, response: Response, next: NextFunction) {

    }

    async login(request: APIRequest, response: Response, next: NextFunction) {

    }
}