import { Router } from 'express';
import userRouter from '@routes/http/userRoutes';
import sectionRouter from '@routes/http/sectionRoutes';
import topicRouter from '@routes/http/topicsRouter';
import testRouter from "src/test/router";


const router = Router();


router.use('/users/', userRouter);
router.use('/sections/', sectionRouter);

router.use('/sections/:section_id/topics/', topicRouter);
router.use("/test/", testRouter);

export default router;