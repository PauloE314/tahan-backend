import { Router } from 'express';
import userRouter from '@routes/userRoutes';
import sectionRouter from '@routes/sectionRoutes';
import topicRouter from '@routes/topicsRouter';

const router = Router();


router.use('/users/', userRouter);
router.use('/sections/', sectionRouter);
router.use('/sections/:section_id/', topicRouter);

export default router;