import { APIRequest } from "src/@types/global";
import { NextFunction, Response } from "express";

export default class Test {
    test (request: APIRequest, response: Response, next: NextFunction) {
        return response.send({message: "WORK"})
    }
}