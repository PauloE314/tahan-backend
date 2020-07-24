import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";

import { Posts } from '@models/Posts';
import { getRepository } from "typeorm";
import { Users } from "@models/User";
import { Validator } from "src/utils/classes";


const rules = {
    title: /.{5,}/
}



export default class PostValidator extends Validator {

    // Validators de rota
    public create_validation = async (request: APIRequest, response: Response, next: NextFunction) =>  {
        this.clear();
        const { title, content } = request.body;
        const user = request.user.info;

        // Validação de usuário
        const user_validation = await this.createFieldValidator({
            name: "user", data: user, validation: this.validate_user
        });

        if (!user_validation.isValid)
            return response.status(401).send({ user: user_validation.message });

        // Validação de título
        const title_validation = await this.createFieldValidator({
            name: "title", data: title, validation: this.validate_title
        });

        // Validação de conteúdo
        const content_validation = await this.createFieldValidator({
            name: "content", data: content, validation: this.validate_content
        });
        
        // Resposta
        return this.answer(request, response, next);
    }


    public update_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        this.clear();
        const { title, content } = request.body;
        const { post, user } = request;

        // Validação de usuário
        const user_validation = await this.createFieldValidator({
            name: "content", data: user.info, validation:  this.validate_user, options: { post, isAuthor: true}
        })

        // Validação de usuário
        if (!user_validation.isValid)
            return response.status(401).send({ user: user_validation.message});

        // Validação de conteúdo
        const content_validation = await this.createFieldValidator({
            name: "content", data: content, validation: this.validate_content, options: { optional: true }
        });
        

        const title_validation = await this.createFieldValidator({
            name: "title", data: title, validation: this.validate_title, options: { optional: true, existent_postId: post.id }
        });

        // Retornando erros ou não
        return this.answer(request, response, next);
    }

    
    public delete_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        this.clear();
        const { user, post } = request;

        const user_validation = await this.createFieldValidator({
            name: "user", data: user.info, validation: this.validate_user, options: { post, isAuthor: true }
        })

        return this.answer(request, response, next);
    }
    




    // Validators de campos
    // Validator de título
    private async validate_title (title: string | undefined, options?: { optional: boolean, existent_postId?: number }) {
        // Validação de título
        if (title && rules.title.test(title)) {
            const same_title_post = await getRepository(Posts).findOne({title});
            const existent_postId = options ? options.existent_postId : null;
            // Checa se o título já não existe
            if (same_title_post) 
                if (same_title_post.id !== existent_postId)
                    return "Esse título já foi escolhido para outro tópico";
            
        }
        else 
            return "Envie um título válido - maior que 5 caracteres";
    
        return;
    }

    // Validator de conteúdo
    private async validate_content (content: string | undefined, options?: { optional: boolean }){
        // Validação de conteúdo
        if (!content) 
            return "Envie conteúdo para o post";

        return;
    }

    // Validator de user
    private async validate_user (user: Users, options?: { post: Posts, isAuthor: boolean }) {
        let response: string;
        if (user.occupation !== "teacher") 
            response ="O usuário não pode criar um post. É necessário ser um professor para tal";

        if (options) 
            if (options.isAuthor) {
                const post_author_id = (await getRepository(Posts).findOne({
                    relations: ["author"],
                    where: { id: options.post.id }
                })).author.id;

                if (post_author_id !== user.id) 
                    response = "O usuário não tem permissão para essa ação; apenas o autor possui";
            }

        return response;
    }
}