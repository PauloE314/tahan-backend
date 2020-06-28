import { Router } from 'express';
import sectionController from '@controllers/sectionsController';
import SectionValidator from '@middlewares/validators/sectionValidators';

const routes = Router({ mergeParams: true });
const controller = new sectionController();
const validator = new SectionValidator();

// Leitura
routes.get('/', controller.list);
routes.get('/:id/', validator.read_validation, controller.read);

// Criar
// routes.post('/', controller.create);

export default routes;
