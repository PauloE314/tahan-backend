import { APIRequest } from "src/@types/global";
import { Response, NextFunction } from "express";

import { getRepository } from "typeorm";
import { Sections } from "@models/Sections";

export async function getSection(request: APIRequest, response: Response, next: NextFunction) {
    const { section_id } = request.params;

    const sectionsRepo = getRepository(Sections);

    const section = await sectionsRepo.findOne({ id: Number(section_id)});

    if (!section) {
        return response.status(401).send({message: "Seção não encontrada"});
    }
    request.section = section;
    return next();
}