import { Router } from 'express';
import user_routes from '../users/routes';

const router = Router();

router.use('/users/', user_routes);;

export default router;