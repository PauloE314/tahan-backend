import { Router } from 'express';
import userRouter from '@routes/userRoutes';
import sectionRouter from '@routes/sectionRoutes';
import topicRouter from '@routes/topicsRouter';
import quizRouter from '@routes/quizRouter';


const router = Router();


router.use('/users/', userRouter);
router.use('/sections/', sectionRouter);

router.use('/sections/:section_id/topics/', topicRouter);
router.use("/sections/:section_id/quizzes/", quizRouter);


export default router;