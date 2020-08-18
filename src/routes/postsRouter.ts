import { Router } from 'express';
import { getPost } from '@middlewares/index';
import { auth_require, is_teacher } from "@middlewares/auth"
import { PostsController } from '@controllers/posts/postsController';


const controller = new PostsController();
const routes = Router({ mergeParams: true });


// Leitura de postagens
routes.get('/', controller.list);

// Leitura de postagem
routes.get('/:postId([0-9]+)', getPost('long'), controller.read);

// Criação de postagens
routes.post('/', auth_require, is_teacher, controller.create.bind(controller));

// Update de postagens
routes.put('/:postId([0-9]+)/',  auth_require, is_teacher, getPost('medium'), controller.update);

// Delete de postagens
routes.delete('/:postId([0-9]+)/', auth_require, is_teacher, getPost('short'), controller.delete);

// Likes
routes.post('/:postId([0-9]+)/like', auth_require, getPost('long'), controller.like);

// Listagem de comentários
routes.get('/:postId([0-9]+)/comments', auth_require, getPost('short'), controller.listComments);

// Criação de comentários
routes.post('/:postId([0-9]+)/comments', auth_require, getPost('short'), controller.createComments);

// Delete de comentários
routes.delete('/comments/:postCommentId([0-9]+)', auth_require, controller.deleteComment)



export default routes;
