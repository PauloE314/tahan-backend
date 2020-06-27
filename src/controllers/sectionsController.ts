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

  // Ver uma seção específica
  async read(request: APIRequest, response: Response, next: NextFunction) {
    const sectionsRepo = getRepository(Sections);

    const id = Number(request.params.id);

    if (!isNaN(id)) {
      const section = await sectionsRepo.findOne({ id });
      const resp = { ...section, topics: section.topics ? section.topics : [] };

      return response.send(resp);
    }

    return next();
  }
}
