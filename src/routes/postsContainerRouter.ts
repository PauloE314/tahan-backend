import { Router, NextFunction, Response } from 'express';
import { auth_require, is_student, is_teacher } from "@middlewares/auth"
import ContainersController from '@controllers/postContainersController';
import ContainersValidator from '@middlewares/validators/postContainersValidators';
import router from 'src/app/router';
import { getContainer } from '@middlewares/index';

const routes = Router({ mergeParams: true });
const controller = new ContainersController();
const validator = new ContainersValidator();

// Listagem
routes.get('/', controller.list);

// Criação
routes.post('/', auth_require, is_teacher, validator.create_validation, controller.create);


// Visualização
routes.get('/:id([0-9]+)/', getContainer, controller.read);

// Atualização
routes.put("/:id([0-9]+)/", auth_require, is_teacher, getContainer, validator.update_validation, controller.update);

// Delete
routes.delete("/:id([0-9]+)/", auth_require, is_teacher, getContainer, validator.delete_validation, controller.delete);



export default routes;
