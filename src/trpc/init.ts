import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';
import { auth } from '@clerk/nextjs/server';

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const { userId } = await auth();
  return { userId };
});

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
 transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

/**
 * 受保护的 procedure，仅允许已登录用户访问
 * 会自动验证用户是否已通过 Clerk 登录
 */
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  
  // 检查用户是否已登录
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '您需要先登录才能访问此资源',
    });
  }
  
  // 将 userId 传递给后续处理器
  return opts.next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // 确保 userId 存在
    },
  });
});

export { superjson as transformer };

