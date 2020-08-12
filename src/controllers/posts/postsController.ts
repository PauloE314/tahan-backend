import { IPostsController, IPostsRepository, IPostsValidator } from "./postsTypes";
import { getCustomRepository, getRepository } from "typeorm";
import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";
import { APIRoute, ValidationError } from "src/utils";
import { Likes } from "@models/Posts/Likes";
import { codes } from "@config/server";

/**
 * Controlador de rotas relacionadas aos posts da aplicação.
 */
export class PostsController implements IPostsController {

    constructor(
        private repository: new () => IPostsRepository,
        private validator: IPostsValidator
    ) {  }

    /**
     * **web: /posts/ - GET**
     * 
     * Lista de postagens. Permite filtro por:
     * 
     * - nome do autor: string
     * - id do autor: number
     * - título: string
     */
    @APIRoute
    async list(request: APIRequest, response: Response, next: NextFunction) {
        const { query } = request;

        const posts = await this.repo.findPosts(query);

        return response.send(posts);
    }

    /**
     * **web: /posts/ - POST**
     * 
     * Cria um novo post
     */
    @APIRoute
    async create(request: APIRequest, response: Response, next: NextFunction) {
        const { title, contents, academic_level, description, topic } = request.body;
        const user = request.user.info;

        const validatedData = await this.validator.create({
            title, contents, academic_level, description, topic
        });
        const createdPost = await this.repo.createPosts({ ...validatedData, author: user });

        delete createdPost.author;


        return response.status(codes.CREATED).send(createdPost);
    }

    /**
     * **web: /posts/:id - GET**
     * 
     * Retorna um post especificado na URL
     */
    @APIRoute
    async read(request: APIRequest, response: Response, next: NextFunction) {
        const user = request.user ? request.user.info: undefined;
        const { post } = request;
        const { comment_count, comment_page } = request.query;

        const params = {
            count: comment_count,
            page: comment_page,
        }

        // Carrega todos os dados de uma postagem
        const fullPost = await this.repo.getFullPost({ id: post.id, params, user });
        
        return response.send(fullPost);
    }

    /**
     * **web: /posts/:id - PUT**
     * 
     * Atualiza o post
     */
    @APIRoute
    async update(request: APIRequest, response: Response, next: NextFunction) {
        const { title, add, remove, academic_level, description } = request.body;
        const author = request.user.info;
        const post = request.post;

        const validatedData = await this.validator.update({ title, add, remove, academic_level, description, author, post });

        const updatedPost = await this.repo.updatePost({ ...validatedData, post });

        delete updatedPost.author;

        return response.send(updatedPost);
    }

    /**
     * **web: /posts/:id - PUT**
     * 
     * Permite deletar o quiz
     */
    @APIRoute
    async delete(request: APIRequest, response: Response, next: NextFunction) {
        const { post } = request;
        const user = request.user.info;

        this.validator.isPostAuthor(post, user);

        this.repo.remove(post);

        return response.send({ message: "Postagem deletada com sucesso" });
    }

    /**
     * **web: /posts/:id/like - POST**
     * 
     * Alterna o estado de like de um post
     */
    @APIRoute
    async like(request: APIRequest, response: Response, next: NextFunction) {
        const user = request.user.info;
        const { post } = request;
        const likesRepo = getRepository(Likes);

        const userLiked = await this.repo.userLikedPost(user.id, post.id);

        // Remove o like caso ele exista
        if (userLiked) {
            await likesRepo.remove(userLiked);

            return response.send({ message: "Like removido" });
        }

        // Cria um novo like
        else {
            const newLike = new Likes();
            newLike.user = user;
            newLike.post = post;
            await likesRepo.save(newLike);

            return response.send({ message: "Like adicionado" });
        }
    }

    /**
     * **web: /posts/:id/comment - POST**
     * 
     * Permite comentar em um post
     */
    @APIRoute
    async comment(request: APIRequest, response: Response, next: NextFunction) {
        const { post } = request;
        const user = request.user.info;
        const { text, reference } = request.body;

        const validatedData = await this.validator.comment({ text, reference });

        const comment = await this.repo.writeComment({ author: user, post: post, ...validatedData});

        // Normaliza os dados de resposta 
        delete comment.post;
        delete comment.author;

        return response.status(codes.CREATED).send(comment);
    }
    

    get repo() {
        return getCustomRepository(this.repository);
    }
}