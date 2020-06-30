import { Response, NextFunction } from 'express';
import { Sections } from '@models/Sections';

import { APIRequest } from 'src/@types/global';
import { getRepository } from 'typeorm';

export default class SectionController {
  // Lista as seções
    async list(request: APIRequest, response: Response, next: NextFunction) {
        const sectionRepo = getRepository(Sections);

        try {
          const sections = await sectionRepo.find();
          return response.send(sections);
        } catch (err) {
          next(err);
        }
    }
}
