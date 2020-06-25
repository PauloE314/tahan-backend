import { Router } from 'express';
import userRouter from '@routes/userRoutes';
import sectionRouter from '@routes/sectionRoutes';

const router = Router();


router.use('/users/', userRouter);
router.use('/sections/', sectionRouter);

export default router;