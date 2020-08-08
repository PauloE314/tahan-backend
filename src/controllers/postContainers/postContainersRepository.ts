import { IPostContainerRepository } from "./postContainersTypes";
import { BaseRepository } from "src/utils/bases";
import { Containers } from "@models/Posts/Containers";

/**
 * Repositório dos containers de posts da aplicação.
 */
export class PostContainersRepository extends BaseRepository<Containers> implements IPostContainerRepository {

}