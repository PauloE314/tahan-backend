import { Router } from 'express';
import { getPost, getPostComment } from '@middlewares/index';
import { auth_require, is_teacher } from "@middlewares/auth"
import { PostsController } from '@controllers/posts/postsController';
import { PostsValidator } from '@controllers/posts/postsValidator';
import { PostsRepository } from '@controllers/posts/postsRepository';


const controller = new PostsController();
const routes = Router({ mergeParams: true });


// Leitura de postagens
routes.get(
    '/',
    controller.list.bind(controller)
);

routes.get(
    '/:id([0-9]+)',
    getPost('long'),
    controller.read.bind(controller)
);

// Criação
routes.post(
    '/',
    auth_require, is_teacher,
    controller.create.bind(controller)
);

// Update
routes.put(
    '/:id([0-9]+)/',
    auth_require, is_teacher, getPost('medium'),
    controller.update.bind(controller)
);

// Delete
routes.delete(
    '/:id([0-9]+)/',
    auth_require, is_teacher, getPost('short'),
    controller.delete.bind(controller)
);

// Likes
routes.post(
    '/:id([0-9]+)/like',
    auth_require, getPost('long'),
    controller.like.bind(controller)
)

// Comentários
routes.get(
    '/:id([0-9]+)/comments',
    auth_require, getPost('short'),
    controller.listComments.bind(controller)
    );
    
routes.post(
    '/:id([0-9]+)/comments',
    auth_require, getPost('short'),
    controller.createComments.bind(controller)
)   

routes.delete(
    '/comments/:postCommentId([0-9]+)',
    auth_require,
    controller.deleteComment
)


// Criar
// routes.post('/', controller.create);

export default routes;
