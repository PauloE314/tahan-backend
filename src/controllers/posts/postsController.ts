import { IPostsController, IPostsRepository, IPostsValidator } from "./postsTypes";
import { getCustomRepository } from "typeorm";

/**
 * Controlador de rotas relacionadas aos posts da aplicação.
 */
export class PostsController implements IPostsController {

    constructor(
        private repository: new () => IPostsRepository,
        private validator: IPostsValidator
    ) {  }
    

    get repo() {
        return getCustomRepository(this.repository);
    }
}