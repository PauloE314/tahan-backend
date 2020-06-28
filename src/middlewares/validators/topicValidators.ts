import { APIRequest } from "src/@types/global";
import { Response, NextFunction } from "express";

import { Topics } from '@models/Topics';
import { getRepository } from "typeorm";
import { Users } from "@models/User";
import { FieldValidator } from "src/@types/global";


const rules = {
    title: /.{5,}/
}



export default class TopicValidator {

    // Validators de rota
    public create_validation = async (request: APIRequest, response: Response, next: NextFunction) =>  {
        const { title, content } = request.body;
        const user = request.user.info;
        const errors: {title?: string, content?:string} = {};

        const title_validation = await this.validate_title(title);
        const content_validation = await this.validate_content(content);
        const user_validation = await this.validate_user(user);
        

        // Validação de usuário
        if (!user_validation.isValid)
            return response.status(401).send({ user: user_validation.message });

        // Validação de título
        if (!title_validation.isValid)
            errors.title = title_validation.message;

        // Validação de conteúdo
        if (!content_validation.isValid)
            errors.content = content_validation.message;

    
        // Retornando erros ou não
        if (Object.keys(errors).length)
            return response.status(400).send(errors);
        next();
    }


    public update_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        const { title, content } = request.body;
        const { topic, user } = request;
        const errors: {title?: string, content?: string} = {};

        const user_validation = await this.validate_user(user.info, { topic, isAuthor: true });

        // Validação de usuário
        if (!user_validation.isValid)
            return response.status(401).send({ user: user_validation.message});

            
        const content_validation = await this.validate_content(content);
        const title_validation = await this.validate_title(title, topic.id);

        // Caso exista um título, checa se é válido
        if (title)
            if (!title_validation.isValid)
                errors.title = title_validation.message;
        
        // Caso exista um conteúdo, checa se é válido
        if (content)
            if (!content_validation.isValid)
                errors.content = content_validation.message;

        // Retornando erros ou não
        if (Object.keys(errors).length)
            return response.status(400).send(errors);

        return next();
    }

    
    public delete_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        const { user, topic } = request;

        const user_validation = await this.validate_user(user.info, { topic, isAuthor: true });

        if (!user_validation.isValid)
            return response.status(401).send({ user: user_validation.message});

        return next();
    }
    




    // Validators de campos
    // Validator de título
    private async validate_title (title: string | undefined, existent_topicId?: number) : Promise<FieldValidator> {
        const response : FieldValidator = {
            isValid: true
        };
        // Validação de título
        if (title && rules.title.test(title)) {
            const same_title_topic = await getRepository(Topics).findOne({title});
            // Checa se o título já não existe
            if (same_title_topic) {
                if (same_title_topic.id !== existent_topicId) {
                    response.isValid = false
                    response.message = "Esse título já foi escolhido para outro tópico";
                }
            }
        }
        else {
            response.isValid = false;
            response.message = "Envie um título válido - maior que 5 caracteres";
        }
        return response;
    }

    // Validator de conteúdo
    private async validate_content (content: string | undefined) : Promise<FieldValidator> {
        const response : FieldValidator = {
            isValid: true
        };

        // Validação de conteúdo
        if (!content) {
            response.isValid = false;
            response.message = "Envie conteúdo para o tópico";
        }

        return response;
    }

    // Validator de user
    private async validate_user (user: Users, options?: { topic: Topics, isAuthor: boolean }) : Promise<FieldValidator> {
        const response : FieldValidator = {
            isValid: true
        };

        if (user.occupation !== "teacher") {
            response.isValid = false;
            response.message =  "O usuário não pode criar um tópico. É necessário ser um professor para tal";
        }

        if (options) 
            if (options.isAuthor) {
                const topicAuthorId = (await getRepository(Topics).findOne({
                    relations: ["author"],
                    where: { id: options.topic.id }
                })).author.id;

                if (topicAuthorId !== user.id) {
                    response.isValid = false;
                    response.message = "O usuário não tem permissão para essa ação; apenas o autor possui";
                }
            }

        return response;
    }
}