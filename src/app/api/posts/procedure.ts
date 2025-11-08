import { z } from 'zod';
import { protectedProcedure, createTRPCRouter } from '@/trpc/init';
import { db } from '@/db';
import { posts, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const postRouter = createTRPCRouter({
  // 创建文章 - 受保护的路由
  createPost: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, '标题不能为空').max(200, '标题最多200个字符'),
        content: z.string().min(1, '内容不能为空'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { title, content } = input;
      const clerkId = ctx.userId; // 从 context 获取已认证的用户 ID

      try {
        // 通过 clerkId 查找数据库中的用户
        const user = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkId),
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在，请先完成用户同步',
          });
        }

        // 创建文章
        const newPost = await db.insert(posts)
          .values({
            title,
            content,
            authorId: user.id, // 使用数据库中的用户 ID
          })
          .returning();

        return {
          success: true,
          post: newPost[0],
        };
      } catch (error) {
        console.error('创建文章失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '创建文章失败，请稍后重试',
        });
      }
    }),
});

// 导出类型
export type PostRouter = typeof postRouter;