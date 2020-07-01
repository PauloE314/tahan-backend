import { APIRequest } from "src/@types/global";
import { Response, NextFunction } from "express";

import { Topics } from '@models/Topics';
import { getRepository } from "typeorm";
import { Users } from "@models/User";
import { Validator } from "src/utils/classes";


const rules = {
    title: /.{5,}/
}



export default class TopicValidator extends Validator {

    // Validators de rota
    public create_validation = async (request: APIRequest, response: Response, next: NextFunction) =>  {
        this.clear();
        const { name } = request.body;

        // Validação de usuário
        await this.createFieldValidator({
            name: "name", data: name, validation: this.validate_name
        });

        
        // Resposta
        return this.answer(request, response, next);
    }




    // Validators de campos
    // Validator de título
    private async validate_name (name: string | undefined, options?: { optional: boolean }) {
        // Validação de título
        
        if (!name)
            return "Envie um nome para o quizz";

        if (name.length < 5)
            return "Envie um nome que tenha mais de 5 caracateres";

    
        return;
    }
}