import { Response, NextFunction } from 'express';
import { Topics } from '@models/Topics';

import { APIRequest } from 'src/@types/global';
import { getRepository } from 'typeorm';


export default class TopicController {
    async list(request: APIRequest, response: Response, next: NextFunction) {
        const { topics } = request.section;

        
        return response.send(topics ? topics : [])
    }

    async create(request: APIRequest, response: Response, next: NextFunction) {
        const { topics } = request.section;
        const new_topic = new Topics();

        const { title, content, order } = request.body;
        new_topic.title = title;
        new_topic.content = content;
        new_topic.order = 1;
        new_topic.section = request.section;
        new_topic.author = request.user.info;

        const topicRepo = getRepository(Topics);
        const saved_topic = await topicRepo.save(new_topic);
        

        
        return response.send(saved_topic)
    }
}