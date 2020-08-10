import { IPostContainerController, IPostContainerRepository, IPostContainerValidator } from "./postContainersTypes";
import { getCustomRepository } from "typeorm";

export class PostContainersController implements IPostContainerController {
    constructor (
        private repository: new () => IPostContainerRepository,
        private validator: IPostContainerValidator
    ) {  }
    

    get repo() {
        return getCustomRepository(this.repository);
    }
}