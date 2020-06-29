import { APIRequest } from "src/@types/global";
import { NextFunction, Response } from "express";
import { Validator } from "./classes";

export default class TestValidator extends Validator {
    public test = async (request: APIRequest, response: Response, next: NextFunction) => {
        
        
        try {
            const { name } = request.body;
            const fieldValidator = await this.createFieldValidator("name", name, this.name_validate);
            // fieldValidator.setInvalid("Testando");

            
            return this.answer(request, response, next);
        }
        catch (err) {
            return response.status(500).send({name: err.name, message: err.message})
        }
    }

    private name_validate (name: string) : string | void {
        console.log('VALIDANDO...');

        return "Errado"
    } 
}