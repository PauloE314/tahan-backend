import { Response, NextFunction } from 'express';
import { Topics } from '@models/Topics';

import { APIRequest } from 'src/@types';
import { getRepository } from 'typeorm';
import { SafeMethod } from 'src/utils';

export default class TopicsController {
  /**
   * Lista os tópicos.
   */
  @SafeMethod
  async list(request: APIRequest, response: Response, next: NextFunction) {
    const topics = await getRepository(Topics).find();
    return response.send(topics);
  }
}
