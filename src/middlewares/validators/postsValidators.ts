import { APIRequest } from "src/@types";
import { Response, NextFunction } from "express";

import { Posts } from '@models/Posts/Posts';
import { getRepository } from "typeorm";
import { Users } from "@models/User";
import { Validator } from "src/utils/classes";
import { Comments } from "@models/Posts/Comments";
import { Contents } from "@models/Posts/Contents";


const rules = {
    title: /.{5,}/
}



export default class PostValidator extends Validator {

    // Validators de rota
    public create_validation = async (request: APIRequest, response: Response, next: NextFunction) =>  {
        this.clear();
        const { title, contents, academic_level, description } = request.body;
        const user = request.user.info;
        const levels = ['fundamental', 'médio', 'superior'];

        // Validação de usuário
        const user_validation = await this.createFieldValidator({
            name: "user", data: user, validation: this.validate_user
        });

        if (!user_validation.isValid)
            return response.status(401).send({ user: user_validation.message });

        // Validação de título
        await this.createFieldValidator({
            name: "title", data: title, validation: this.validate_title
        });

        // Validação de descrição
        await this.createFieldValidator({
            name: 'description', data: description, validation: this.validate_description
        })

        // Validação de conteúdo
        await this.createFieldValidator({
            name: "contents", data: contents, validation: this.validate_contents
        });

        // Validação de nível de dificuldade
        await this.createFieldValidator({
            name: 'academic_level', data: academic_level, validation: this.validate_academic_level
        })

        // Resposta
        return this.answer(request, response, next);
    }


    public update_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        this.clear();
        const { title, contents, academic_level, description } = request.body;
        const { post, user } = request;

        // Validação de usuário
        const user_validation = await this.createFieldValidator({
            name: "user", data: user.info, validation:  this.validate_user, options: { post, isAuthor: true}
        })

        // Validação de usuário
        if (!user_validation.isValid)
            return response.status(401).send({ user: user_validation.message});

        
        // Validação de título
        await this.createFieldValidator({
            name: "title", data: title, validation: this.validate_title, options: { optional: true, existent_postId: post.id }
        });

        // Validação de conteúdos
        await this.createFieldValidator({
            name: 'contents', data: contents, validation: this.update_contents, options: { post }
        });

        // Validação de nível de dificuldade
        await this.createFieldValidator({
            name: 'academic_level', data: academic_level, validation: this.validate_academic_level, options: { optional: true }
        })

        // Validação de descrição
        await this.createFieldValidator({
            name: 'description', data: description, validation: this.validate_description, options: { optional: true }
        })
        // Retornando erros ou não
        return this.answer(request, response, next);
    }

    
    public delete_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        this.clear();
        const { user, post } = request;

        const user_validation = await this.createFieldValidator({
            name: "user", data: user.info, validation: this.validate_user, options: { post, isAuthor: true }
        })

        return this.answer(request, response, next);
    }
    
    /**
     * Valida os comentários dos posts
     */
    public comment_validation = async (request: APIRequest, response: Response, next: NextFunction) => {
        this.clear();
        const { text, reference } = request.body;
        // Certifica que existe um texto
        if (!text)
            return response.status(400).send({ message: { text: 'Envie um texto para comentar' }})

        // Se houver uma resposta, certifica que referencia um comentário que existe
        if (reference) {
            const referenced_comment = await getRepository(Comments).findOne({ id: reference });
            if (!referenced_comment)
                return response.status(400).send({ message: { reference: 'Envie uma referência válida' }});
        }

        return next();
    }



    // Validators de campos
    // Validator de título
    private async validate_title (title: string | undefined, options?: { optional: boolean, existent_postId?: number }) {
        // Validação de título
        if (title && rules.title.test(title)) {
            const same_title_post = await getRepository(Posts).findOne({title});
            const existent_postId = options ? options.existent_postId : null;
            // Checa se o título já não existe
            if (same_title_post) 
                if (same_title_post.id !== existent_postId)
                    return "Esse título já foi escolhido para outro tópico";
            
        }
        else 
            return "Envie um título válido - maior que 5 caracteres";
    
        return;
    }

    /**
     * Valida a descrição 
     */
    private async validate_description (description: string) {
    if (typeof description !== 'string' || !description)
        return "Envie uma descrição válida"
    }

    private async validate_academic_level (academic_level: string) {
        const levels = ['fundamental', 'médio', 'superior'];

        if (!levels.includes(academic_level))
            return ""
    }

    // Validator de user
    private async validate_user (user: Users, options?: { post: Posts, isAuthor: boolean }) {
        let response: string;
        if (user.occupation !== "teacher") 
            response ="O usuário não pode criar um post. É necessário ser um professor para tal";

        if (options) 
            if (options.isAuthor) {
                const post_author_id = (await getRepository(Posts).findOne({
                    relations: ["author"],
                    where: { id: options.post.id }
                })).author.id;

                if (post_author_id !== user.id) 
                    response = "O usuário não tem permissão para essa ação; apenas o autor possui";
            }

        return response;
    }

    /**
     * Valida a criação dos conteúdos de um post
     */
    private async validate_contents(contents: Array<{ subtitle: string, text: string }>, check_min = true) {
        const errs = <any>{};
        // Verifica se há conteúdo
        if (!contents)
            return "Envie seus conteúdos";

        // Certifica que o conteúdo é uma lista
        if (!Array.isArray(contents))
            return "Envie uma lista de conteúdos válidos"

        // Certifica que a quantidade de conteúdos é pelo menos a mínima
        if (contents.length == 0 && check_min)
            return "O número mínimo de conteúdos é 1";

        for (let [index, content] of contents.entries()) {
            // Certifica que o objeto tem as propriedades corretas
            if (!content.hasOwnProperty('subtitle') || !content.hasOwnProperty('text')) {
                errs[index] = "Envie um conteúdo válido (subtitle e text)";
                continue;
            }

            // Certifica que esse subtítulo é único
            const before_contentes = contents.splice(0, index);
            const same_subtitle_content = before_contentes.find(cont => cont.subtitle == content.subtitle);
            if (same_subtitle_content)
                errs[index] = "O subtítulo deve ser único";
        }

        if (Object.keys(errs).length !== 0)
            return errs;

        return;
    }
     
    /**
     * Valida a atualização de conteúdos
     */
    private update_contents = async (contents: any, options: { post: Posts }) => {
        const errs = <any>{};

        if (!contents)
            return;

        const { remove, add } = contents;
        const { post } = options;

        // Tenta remover conteúdos
        if (remove) {
            // Certifica que é um array
            if (!Array.isArray(remove))
                errs.remove = 'Envie um array de itens a serem removidos';
            
            else {
                const content_ids = post.contents.map(content => content.id);
                for (let [index, content] of remove.entries()) {
                    // Certifica que o conteúdo a ser removido pertence ao post
                    const content_exist = content_ids.find(id => id == content);
                    if (!content_exist) {
                        if (!errs.hasOwnProperty('remove'))
                            errs.remove = {};

                        errs.remove[index] = "Conteúdo inexistente não pode ser apagado";
                    }
                }
            }                
        }

        // Tenta adicionar conteúdos
        if (add) {
            const add_validation = await this.validate_contents(add, false);

            if (add_validation)
                errs.add = add_validation;
        }
        // Checa se a quantidade de conteúdos é válida
        if (Object.keys(errs).length == 0) {
            const add_length = Array.isArray(add) ? add.length : 0;
            const remove_length = Array.isArray(remove) ? remove.length : 0;

            if (add_length + post.contents.length - remove_length < 1)
                return "A quantidade mínima de conteúdo é 1";
        }
        
        else
            return errs;
    }
}