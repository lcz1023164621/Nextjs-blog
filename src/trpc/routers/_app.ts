import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { userRouter } from '@/app/api/users/procedure';
import { postRouter } from '@/app/api/posts/procedure';
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
});
// export type definition of API
export type AppRouter = typeof appRouter;