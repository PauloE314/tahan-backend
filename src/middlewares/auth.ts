import { APIRequest } from "src/@types/global";
import { Response, NextFunction } from "express";

export function get_user(request: APIRequest, response: Response, next: NextFunction) {
    return next();
}

export function auth_require(request: APIRequest, response: Response, next: NextFunction) {
    return next();
}