import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { userRouter } from '@/app/api/users/procedure';
import { postRouter } from '@/app/api/posts/procedure';
import { CommentRouter } from '@/app/api/comments/precedure';
import { likeRouter } from '@/app/api/likes/procedure';
import { favoritesRouter } from '@/app/api/favourites/procedure';
import { aiRouter } from '@/app/api/ai/precedure';
export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
    user: userRouter,
    post: postRouter,
    comment: CommentRouter,
    like: likeRouter,
    favorites: favoritesRouter,
    ai: aiRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;