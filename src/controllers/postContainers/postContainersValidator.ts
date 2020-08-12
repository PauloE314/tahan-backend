import { BaseValidator } from "src/utils/validators";
import { Users } from "@models/User";
import { Containers } from "@models/Posts/Containers";
import { codes } from "@config/server";

/**
 * Validador de containers de posts.
 */
export class PostContainersValidator extends BaseValidator {

    /**
     * Checa se um usuário é o autor do container
     */
    isContainerAuthor (data: { user: Users, postContainer: Containers }) {
        const { user, postContainer } = data;

        if (postContainer.author.id !== user.id)
            this.RaiseError("Permissão negada", codes.PERMISSION_DENIED);
        
        return {
            user,
            postContainer 
        }
    }

    /**
     * Valida a criação de um container para posts
     */
    createValidator () {

    }

    /**
     * Valida o update de um container para posts
     */
    updateValidator () {
        
    }
}