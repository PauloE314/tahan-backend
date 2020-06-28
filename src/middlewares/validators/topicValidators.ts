import { APIRequest } from "src/@types/global";
import { Response, NextFunction } from "express";

import { Topics } from '@models/Topics';
import { getRepository } from "typeorm";


const rules = {
    title: /.{5,}/
}

interface field_validator {
    isValid: boolean,
    message?: string,
}

export default class TopicValidator {

    public create_validation = async (request: APIRequest, response: Response, next: NextFunction) =>  {
        const { title, content } = request.body;
        const user = request.user.info;
        const errors: {title?: string, content?:string} = {};

        const title_validation = await this.validate_title(title);
        const content_validation = await this.validate_content(content);

        // Validação de usuário
        if (user.occupation !== "teacher")
            return response.status(400).send({
                user: "O usuário não pode criar um tópico. É necessário ser um professor para tal"
            });

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


    public update_validation =  async (request: APIRequest, response: Response, next: NextFunction) => {
        const { title, content } = request.body;
        const { topic, user } = request;
        const errors: {title?: string, content?: string} = {};

        if (user.info.occupation !== "teacher") {
            return response.status(401).send({user: "O usuário não pode alterar um tópico. É necessário ser um professor para tal"})
        }
        else {
            const topicAuthorId = (await getRepository(Topics).findOne({
                relations: ["author"],
                where: { id: topic.id }
            })).author.id;
            if (topicAuthorId !== user.info.id)
                return response.status(401).send({user: "O usuário não tem permissão para alterar o tópico. Apenas seu autor pode"});
        }

        const title_validation = await this.validate_title(title, topic.id);
        const content_validation = await this.validate_content(content);

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
    




    // Validators de campos
    private async validate_title (title: string | undefined, existent_topicId?: number) : Promise<field_validator>{
        const response : field_validator = {
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

    private async validate_content (content: string | undefined) : Promise<field_validator> {
        const response : field_validator = {
            isValid: true
        };

        // Validação de conteúdo
        if (!content) {
            response.isValid = false;
            response.message = "Envie conteúdo para o tópico";
        }

        return response;
    }
}