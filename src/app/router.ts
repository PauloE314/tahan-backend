import { Router } from 'express';
import userRouter from '@routes/userRoutes';
import topicsRouter from '@routes/topicsRoutes';
import postsRouter from '@routes/postsRouter';
import quizRouter from '@routes/quizRouter';
import testRouter from "@routes/testRouter";
import friendsRouter from "@routes/friendshipsRouter";

import postContainersRouter from "@routes/postsContainerRouter";

const router = Router();


router.use('/users/', userRouter);
router.use('/friends/', friendsRouter)
router.use('/topics/', topicsRouter);

router.use('/posts/', postsRouter);
router.use("/quizzes/", quizRouter);

router.use('/post-containers/', postContainersRouter);

router.use("/socket-tests/", testRouter);

export default router;