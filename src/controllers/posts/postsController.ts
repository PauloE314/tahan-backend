import { Response, NextFunction } from "express";
import { getCustomRepository} from "typeorm";
import { APIRequest } from "src/@types";

import { PostsRepository } from "./postsRepository";
import { PostCommentRepository } from "./postCommentRepository";
import { PostsValidator } from "./postsValidator";
import { PostCommentValidator } from "./postCommentValidator";

import { APIRoute } from "src/utils";
import { codes } from "@config/index";


export class PostsController {

    validator = new PostsValidator();
    commentValidator = new PostCommentValidator();

    get repo() { return getCustomRepository(PostsRepository) }
    get commentsRepo() { return getCustomRepository(PostCommentRepository) }


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
        const { title, add, remove, academic_level, description, positions } = request.body;
        const author = request.user.info;
        const post = request.post;

        // Certifica que é o autor
        this.validator.isPostAuthor(post, author);

        const validatedData = await this.validator.update({
            title, add, remove, academic_level, description, post, positions
        });

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

        const postLiked = await this.repo.userLikedPost(user.id, post.id);

        // Remove o like caso ele exista
        if (postLiked) {
            post.likes = post.likes.filter(likeUser => likeUser.id !== user.id);

            await this.repo.save(post);
            return response.send({ message: "Like removido" });
        }

        // Cria um novo like
        else {
            post.likes.push(user);

            await this.repo.save(post);
            return response.send({ message: "Like adicionado" });
        }
    }

    /**
     * **web: /posts/:id/comments - GET**
     * 
     * Permite ver a lista de comentários de uma postagem
     */
    @APIRoute
    async listComments(request: APIRequest, response: Response, next: NextFunction) {
        const { post } = request;
        
        const comments = await this.commentsRepo.listPostComments({
            postId: post.id
        });

        return response.send(comments);
    }

    /**
     * **web: /posts/:id/comments - POST**
     * 
     * Permite comentar em um post
     */
    @APIRoute
    async createComments(request: APIRequest, response: Response, next: NextFunction) {
        const { post } = request;
        const user = request.user.info;
        const { text, reference } = request.body;

        const validatedData = await this.commentValidator.comment({ text, reference });

        const comment = await this.commentsRepo.writeComment({
            author: user,
            post: post,
            ...validatedData
        });

        // Normaliza os dados de resposta 
        delete comment.post;
        delete comment.author;

        return response.status(codes.CREATED).send(comment);
    }

    /**
     * **web: /posts/comments/:id - DELETE**
     * 
     * Permite apagar um comentário
     */
    @APIRoute
    async deleteComment(request: APIRequest, response: Response, next: NextFunction) {
        const user = request.user.info;
        const id = Number(request.params.postCommentId);

        const postComment = await this.commentValidator.postCommentExists({ id });

        this.commentValidator.isPostCommentAuthor({ user, postComment });

        await this.commentsRepo.deleteComment(postComment);

        return response.send({ message: "Comentário apagado com sucesso" });
    }
}