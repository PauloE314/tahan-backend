import { Response, NextFunction, Request } from 'express';
import { Topics } from '@models/Topics';

import { APIRequest } from 'src/@types';
import { getRepository, Like } from 'typeorm';
import { Sections } from '@models/Sections';


export default class TopicController {
    // Lista os tópicos da seção existente
    // Pesquisar por: username do author e titulo
    async list (request: APIRequest, response: Response, next: NextFunction) {
        const query_params = request.query ? request.query : { title: null };
        const where = <any>{ section: { id : request.section.id } };

        if (query_params.title)
            where.title = Like(`%${query_params.title}%`);

        const topics = await getRepository(Topics)
            .find({
                relations: ["author", "section"],
                where
            })

        return response.send(topics);
    }

    // Cria um tópico para a seção
    async create (request: APIRequest, response: Response, next: NextFunction) {
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
    async read (request: APIRequest, response: Response, next: NextFunction) {
        const { topic } = request;
    
        return response.send(topic);
    }

    // Dá update no tópico (título e conteúdo)
    async update (request: APIRequest, response: Response, next: NextFunction) {
        const { topic } = request;
        const { title, content } = request.body;

        if (title)
            topic.title = title;

        if (content)
            topic.content = content;

        try {
            const topicRepo =  getRepository(Topics);
            const saved_topic = await topicRepo.save(topic);

            return response.send(saved_topic);
        }
        catch(err) {
            return response.send(err.message)
        }
    }

    // Deleta o tópico
    async delete (request: APIRequest, response: Response, next: NextFunction) {
        const { topic } = request;

        await getRepository(Topics).remove(topic);

        return response.send({ message: "Tópico deletado com sucesso" });
    }
}