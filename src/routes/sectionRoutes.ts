import { Router } from 'express';
import sectionController from '@controllers/sectionsController';



const routes = Router({ mergeParams: true })
const controller = new sectionController();
// const validator = new UserValidator();


// Leitura
routes.get('/', controller.list);

// Criar
routes.post('/', controller.create);


export default routes;