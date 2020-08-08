import { APIRequest, IApiResponse } from "src/@types";
import { Response, NextFunction } from "express";
import { Users } from "@models/User";
import { Repository, QueryBuilder, SelectQueryBuilder } from "typeorm";
import { BaseRepository } from "src/utils/bases";



/**
 * Interface do controlador de rotas dos amigos
 */
export interface ITopicsController {
    list: IApiResponse
}