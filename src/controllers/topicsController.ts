import { Response, NextFunction } from 'express';
import { Topics } from '@models/Topics';

import { APIRequest } from 'src/@types';
import { getRepository } from 'typeorm';

export default class TopicsController {
  // Lista as seções
    async list(request: APIRequest, response: Response, next: NextFunction) {
      const topics = await getRepository(Topics).find();
      return response.send(topics);
    }
}
