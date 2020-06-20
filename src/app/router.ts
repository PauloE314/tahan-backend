import { Router } from 'express';
import routes from '@users/routes';
import user_routes from '@users/routes';

const router = Router();

routes.use('/users/', user_routes);

export default router;