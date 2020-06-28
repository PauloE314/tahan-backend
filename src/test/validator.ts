import { APIRequest } from "src/@types/global";
import { NextFunction, Response } from "express";
import { NewFieldValidator, Validator } from "./classes";
import { FieldValidator } from "src/@types/classes";

export default class TestValidator extends Validator {
    public test = async (request: APIRequest, response: Response, next: NextFunction) => {
        
        try {
            const { name } = request.body;
            const fieldValidator = new NewFieldValidator("name", name);
            // fieldValidator.setInvalid("Testando");


            this.checkFields([fieldValidator]);
            return this.answer(request, response, next);
        }
        catch (err) {
            return response.status(500).send({name: err.name, message: err.message})
        }
    }

    private async name_validate (name: string) {
        console.log('VALIDANDO...')
    } 
}