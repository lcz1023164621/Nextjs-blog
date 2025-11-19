import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { db } from '@/db';
import { users, posts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const userRouter = createTRPCRouter({
  syncUser: baseProcedure
    .input(
      z.object({
        clerkId: z.string(),
        email: z.string().email().optional(),
        username: z.string(),
        avatar: z.string().optional(),
      })
    )
    .mutation(async (opts) => {
      const { clerkId, email, username, avatar } = opts.input;
      
      try {
        // 检查用户是否已存在
        const existingUser = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkId),
        });
        
        if (existingUser) {
          // 更新现有用户
          const updatedUser = await db.update(users)
            .set({
              email,
              username,
              avatar,
              updatedAt: new Date(),
            })
            .where(eq(users.clerkId, clerkId))
            .returning();
          
          return {
            success: true,
            user: updatedUser[0],
            created: false,
          };
        } else {
          // 创建新用户
          const newUser = await db.insert(users)
            .values({
              clerkId,
              email,
              username,
              avatar,
            })
            .returning();
          
          return {
            success: true,
            user: newUser[0],
            created: true,
          };
        }
      } catch (error) {
        console.error('Error syncing user:', error);
        throw new Error('Failed to sync user');
      }
    }),

  // 获取当前用户发表的文章 - 受保护的路由
  getUserPosts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { limit = 20, offset = 0 } = input || {};
      const clerkId = ctx.userId;

      try {
        // 通过 clerkId 查找数据库中的用户
        const user = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkId),
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }

        // 查询用户发表的文章
        const userPosts = await db.query.posts.findMany({
          where: eq(posts.authorId, user.id),
          limit,
          offset,
          orderBy: (posts, { desc }) => [desc(posts.createdAt)],
          with: {
            author: {
              columns: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            images: {
              columns: {
                id: true,
                imageUrl: true,
              },
            },
            likes: true, // 获取所有点赞记录用于统计
          },
        });

        // 为每篇文章添加点赞状态和统计
        const postsWithLikeStatus = userPosts.map(post => {
          // 检查当前用户是否点赞了该文章
          const isLiked = post.likes.some(like => like.userId === user.id);
          
          return {
            ...post,
            likesCount: post.likes.length, // 添加点赞数统计
            isLiked, // 添加点赞状态
          };
        });

        return {
          success: true,
          posts: postsWithLikeStatus,
        };
      } catch (error) {
        console.error('获取用户文章列表失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取用户文章列表失败',
        });
      }
    }),
});

// 导出类型
export type UserRouter = typeof userRouter;