import { Response, NextFunction, Request } from 'express';
import { Topics } from '@models/Topics';

import { APIRequest } from 'src/@types/global';
import { getRepository } from 'typeorm';
import { Sections } from '@models/Sections';


export default class TopicController {
    // Lista os tópicos da seção existente
    // Pesquisar por: username do author e titulo
    async list(request: APIRequest, response: Response, next: NextFunction) {
        const topics = await getRepository(Topics)
            .find({
                relations: ["author", "section"],
                where: { section: request.section }
            })

        return response.send(topics);
    }

    // Cria um tópico para a seção
    async create(request: APIRequest, response: Response, next: NextFunction) {
        const new_topic = new Topics();

        const { title, content } = request.body;
        new_topic.title = title;
        new_topic.content = content;
        new_topic.section = request.section;
        new_topic.author = request.user.info;

        const topicRepo = getRepository(Topics);
        const saved_topic = await topicRepo.save(new_topic);
        
        return response.send(saved_topic);
    }

    // Ver um tópico específico
    async read(request: APIRequest, response: Response, next: NextFunction) {
        const { topic } = request;

        return response.send(topic);
    }
}