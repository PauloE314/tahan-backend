import { APIRequest } from "src/@types/global";
import { Response, NextFunction } from "express";

import {} from '@models/Topics';
import { getRepository } from "typeorm";
import { Sections } from "@models/Sections";

export default class SectioncValidator {
    async read_validation(request: APIRequest, response: Response, next: NextFunction) {
        const id = Number(request.params.id);


        // Caso seja um texto sendo passado pela URL
        const sectionRepo = getRepository(Sections);

        if (!isNaN(id)) {
            const section = await sectionRepo.findOne({id})
            if (section)
                return next();

            return response.status(404).send({message: "Seção não encontrada"})
        }
        else 
            return next();
        
    }
}