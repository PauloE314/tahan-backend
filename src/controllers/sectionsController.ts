import { Response, NextFunction } from 'express';
import { Sections } from '@models/Sections'

import { APIRequest } from 'src/@types/global';
import { getRepository } from 'typeorm';


 
export default class SectionController{

    async list(request: APIRequest, response: Response, next: NextFunction) {
        const sectionsRepo = getRepository(Sections);
        
        const sections = await sectionsRepo.find();

        return response.send(sections);
    }

    async create(request: APIRequest, response: Response, next: NextFunction) {
        const { name } = request.body;

        const sectionsRepo = getRepository(Sections);
        const section = new Sections();
        section.name = name;

        const saved_sections = await sectionsRepo.save(section);

        return response.send(saved_sections)
    }
}