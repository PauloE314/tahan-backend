import { Router } from 'express';
import userRouter from '@routes/userRoutes';

const router = Router();


router.use('/users/', userRouter);

export default router;