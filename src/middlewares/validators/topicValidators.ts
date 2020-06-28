import { APIRequest } from "src/@types/global";
import { Response, NextFunction } from "express";

import { Topics } from '@models/Topics';
import { getRepository } from "typeorm";


const rules = {
    title: /.{5,}/
}

export default class TopicValidator {

    async create_validation (request: APIRequest, response: Response, next: NextFunction) {
        const { title, content } = request.body;
        const user = request.user.info;
        const errors: {title?: string, content?:string} = {};

        // Validação de usuário
        if (user.occupation !== "teacher")
            return response.status(400).send({
                user: "O usuário não pode criar um tópico. É necessário ser um professor para tal"
            });

        // Validação de título
        if (title && rules.title.test(title)) {
            const same_title_topic = await getRepository(Topics).findOne({title});
            // Checa se o título já não existe
            if (same_title_topic) 
                errors.title = "Esse título já foi escolhido para outro tópico";
        }
        else
            errors.title = "Envie um título válido - maior que 5 caracteres";

        // Validação de conteúdo
        if (!content)
            errors.title = "Envie conteúdo para o tópico";

        

        // Retornando erros ou não
        if (Object.keys(errors).length)
            return response.status(400).send(errors);
        next();
    }

    async read_validation (request: APIRequest, response: Response, next: NextFunction) {
        const id = Number(request.params.id);

        if (!isNaN(id)) {
            const topic = await getRepository(Topics).findOne({ id });

            if (!topic)
                return response.send({message: "Tópico não encontrado"})

            request.topic = topic;
        }

        return next();
    }
}