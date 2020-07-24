import { Router } from 'express';
import userRouter from '@routes/userRoutes';
import topicsRouter from '@routes/topicsRoutes';
import postsRouter from '@routes/postsRouter';
import quizRouter from '@routes/quizRouter';
import testRouter from "@routes/testRouter"

const router = Router();


router.use('/users/', userRouter);
router.use('/topics/', topicsRouter);

router.use('/topics/:topic_id/posts/', postsRouter);
router.use("/topics/:topic_id/quizzes/", quizRouter);

router.use("/tests/", testRouter);

export default router;