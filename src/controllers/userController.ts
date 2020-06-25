import { Response, NextFunction } from 'express';
import { getRepository, Like } from 'typeorm';
import jwt from 'jsonwebtoken';
import crypto from 'bcrypt';

import { APIRequest } from 'src/@types/global';
import { Users } from '@models/User';
import configs from '@config/server'


 
export default class UserController{

    // Lista todos os usuários com pesquisa
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

    // Cria um usuário
    async create (request: APIRequest, response: Response, next: NextFunction) {
        const { username, password, email, occupation } = request.body;
        const image = request.file;
        const userRepo = getRepository(Users);

        const user = new Users();
        user.username = username;
        user.email = email;
        user.password = crypto.hashSync(password, 10);
        user.occupation = occupation;

        if (image)
            user.image = image.filename;

        try {
            const new_user = await userRepo.save(user);
            return response.send(new_user)
        }
        catch(err) {
            response.status(500).send({message: err.message, name: err.name})
        }
    }

    // Retorna as informações de um usuário
    async read (request: APIRequest, response: Response, next: NextFunction) {
        const id = Number(request.params.id);
        if (!isNaN(id)) {
            const userRepo = getRepository(Users);
            const user = await userRepo.findOne({id})
            
            return response.send(user);
        }
        return next();
    }

    // Retorna as informações do usuário logado
    async read_self (request: APIRequest, response: Response, next: NextFunction) {
        // Retorna as informações do usuário
        const user = request.user;

        return response.send(user)
    }

    async update (request: APIRequest, response: Response, next: NextFunction) {
        const { username, password } = request.body;
        const user = request.user.info;
        const userRepo = getRepository(Users);

        if (username)
            user.username = username;
        
        if (password)
            user.password = crypto.hashSync(password, 10);
        


        const updated_user = await userRepo.save(user)
        return response.send(updated_user)
    }

    async delete (request: APIRequest, response: Response, next: NextFunction) {
        const userRepo = getRepository(Users);
        const user = request.user.info;
        
        await userRepo.remove(user);

        return response.send({message: "Usuário removido com sucesso"})
    }

    // Login
    async login (request: APIRequest, response: Response, next: NextFunction) {
        const {secret_key, jwtTime} = configs;
        const { email, password } = request.body;

        const userRepo = getRepository(Users);
        const user = await userRepo.findOne({email});

        // Caso não exista um usuário com esse username
        if (!user)
            return response.status(400).send({email: "Email inválido"})

        // Caso exista, compara a senha enviada e a do usuário
        const rightPassword = crypto.compareSync(password, user.password);

        // Caso não forem iguais, retorna erro
        if (!rightPassword)
            return response.status(400).send({password: "Senha inválida"})

        // Se forem iguais, autializa o JWT
        const login_token = jwt.sign({id: user.id}, secret_key, {expiresIn: jwtTime});

        // Retorna as informações do usuário
        return response.send({user, token: login_token});
    }
}