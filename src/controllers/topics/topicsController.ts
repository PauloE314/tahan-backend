import { APIRoute } from "src/utils";
import { APIRequest } from "src/@types";
import { Response } from "express";
import { getRepository } from "typeorm";
import { Topics } from "@models/Topics";

/**
 * Controlador de rotas dos tópicos da aplicação. Tópicos são divisões preestabelecidas (por meios de 'seeds'), por exemplo, matemática, português, etc.
 */
export class TopicsController {

    /**
   * **web: /users/ - GET**
   * 
   * Lista todos os tópicos da aplicação. Como serão poucos os tópicos, a resposta será uma simples lista não paginada e sem filtros.
   * 
   */
    @APIRoute
    async list(request: APIRequest, response: Response) {
        return response.send(await getRepository(Topics).find());
    }
}