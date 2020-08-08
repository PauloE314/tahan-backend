import { IPostsRepository } from "./postsTypes";
import { BaseRepository } from "src/utils/bases";
import { Posts } from "@models/Posts/Posts";

/**
 * Repositório dos posts da aplicação.
 */
export class PostsRepository extends BaseRepository<Posts> implements IPostsRepository {

}