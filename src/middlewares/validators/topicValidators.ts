import { APIRequest } from "src/@types/global";
import { Response, NextFunction } from "express";

import { Topics } from '@models/Topics';
import { getRepository } from "typeorm";
import { Users } from "@models/User";
import { Validator } from "src/@types/classes";


const rules = {
    title: /.{5,}/
}



export default class TopicValidator extends Validator {

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
        const { topic, user } = request;

        // Validação de usuário
        const user_validation = await this.createFieldValidator({
            name: "content", data: user.info, validation:  this.validate_user, options: { topic, isAuthor: true}
        })

        // Validação de usuário
        if (!user_validation.isValid)
            return response.status(401).send({ user: user_validation.message});

        // Validação de conteúdo
        const content_validation = await this.createFieldValidator({
            name: "content", data: content, validation: this.validate_content, options: { optional: true }
        });
        

        const title_validation = await this.createFieldValidator({
            name: "title", data: title, validation: this.validate_title, options: { optional: true, existent_topicId: topic.id}
        });

        // Retornando erros ou não
        return this.answer(request, response, next);
    }

    
    public delete_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        this.clear();
        const { user, topic } = request;

        const user_validation = await this.createFieldValidator({
            name: "user", data: user.info, validation: this.validate_user, options: { topic, isAuthor: true }
        })

        return this.answer(request, response, next);
    }
    




    // Validators de campos
    // Validator de título
    private async validate_title (title: string | undefined, options?: { optional: boolean, existent_topicId?: number }) {
        // Validação de título
        if (title && rules.title.test(title)) {
            const same_title_topic = await getRepository(Topics).findOne({title});
            const existent_topicId = options ? options.existent_topicId : null;
            // Checa se o título já não existe
            if (same_title_topic) 
                if (same_title_topic.id !== existent_topicId)
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
            return "Envie conteúdo para o tópico";

        return;
    }

    // Validator de user
    private async validate_user (user: Users, options?: { topic: Topics, isAuthor: boolean }) {
        let response: string;
        if (user.occupation !== "teacher") 
            response ="O usuário não pode criar um tópico. É necessário ser um professor para tal";

        if (options) 
            if (options.isAuthor) {
                const topicAuthorId = (await getRepository(Topics).findOne({
                    relations: ["author"],
                    where: { id: options.topic.id }
                })).author.id;

                if (topicAuthorId !== user.id) 
                    response = "O usuário não tem permissão para essa ação; apenas o autor possui";
            }

        return response;
    }
}