import { Router} from 'express';
import { auth_require, is_teacher } from "@middlewares/auth"
import { PostContainersController } from '@controllers/postContainers/postContainersController';
import { getContainer } from '@middlewares/index';

const routes = Router({ mergeParams: true });
const controller = new PostContainersController();

// Listagem
routes.get('/', controller.list);

// Criação
routes.post('/', auth_require, is_teacher, controller.create);


// Visualização
routes.get('/:postContainerId([0-9]+)/', getContainer("likes"), controller.read);

// // Atualização
routes.put("/:postContainerId([0-9]+)/", auth_require, is_teacher, getContainer(), controller.update);

// // Delete
routes.delete("/:postContainerId([0-9]+)/", auth_require, is_teacher, getContainer(), controller.delete);


export default routes;
