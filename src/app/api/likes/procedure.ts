import { z } from 'zod';
import { protectedProcedure, createTRPCRouter } from '@/trpc/init';
import { db } from '@/db';
import { postLikes, users, posts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const likeRouter = createTRPCRouter({
  // 切换点赞状态（智能点赞/取消点赞）- 受保护的路由
  toggleLike: protectedProcedure
    .input(
      z.object({
        postId: z.string().uuid('无效的文章ID'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { postId } = input;
      const clerkId = ctx.userId;

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

        // 验证文章是否存在
        const post = await db.query.posts.findFirst({
          where: eq(posts.id, postId),
        });

        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '文章不存在',
          });
        }

        // 检查是否已经点赞
        const existingLike = await db.query.postLikes.findFirst({
          where: and(
            eq(postLikes.postId, postId),
            eq(postLikes.userId, user.id)
          ),
        });

        if (existingLike) {
          // 已点赞，执行取消点赞
          await db.delete(postLikes).where(
            and(
              eq(postLikes.postId, postId),
              eq(postLikes.userId, user.id)
            )
          );

          return {
            success: true,
            isLiked: false,
            message: '取消点赞成功',
          };
        } else {
          // 未点赞，执行点赞
          await db.insert(postLikes)
            .values({
              postId,
              userId: user.id,
            });

          return {
            success: true,
            isLiked: true,
            message: '点赞成功',
          };
        }
      } catch (error) {
        console.error('切换点赞状态失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '操作失败，请稍后重试',
        });
      }
    }),

  // 点赞文章 - 受保护的路由
  likePost: protectedProcedure
    .input(
      z.object({
        postId: z.string().uuid('无效的文章ID'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { postId } = input;
      const clerkId = ctx.userId;

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

        // 验证文章是否存在
        const post = await db.query.posts.findFirst({
          where: eq(posts.id, postId),
        });

        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '文章不存在',
          });
        }

        // 检查是否已经点赞
        const existingLike = await db.query.postLikes.findFirst({
          where: and(
            eq(postLikes.postId, postId),
            eq(postLikes.userId, user.id)
          ),
        });

        if (existingLike) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '您已经点赞过此文章',
          });
        }

        // 添加点赞记录
        const newLike = await db.insert(postLikes)
          .values({
            postId,
            userId: user.id,
          })
          .returning();

        return {
          success: true,
          like: newLike[0],
          message: '点赞成功',
        };
      } catch (error) {
        console.error('点赞失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '点赞失败，请稍后重试',
        });
      }
    }),

  // 取消点赞 - 受保护的路由
  unlikePost: protectedProcedure
    .input(
      z.object({
        postId: z.string().uuid('无效的文章ID'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { postId } = input;
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

        // 查找点赞记录
        const existingLike = await db.query.postLikes.findFirst({
          where: and(
            eq(postLikes.postId, postId),
            eq(postLikes.userId, user.id)
          ),
        });

        if (!existingLike) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '您还未点赞此文章',
          });
        }

        // 删除点赞记录
        await db.delete(postLikes).where(
          and(
            eq(postLikes.postId, postId),
            eq(postLikes.userId, user.id)
          )
        );

        return {
          success: true,
          message: '取消点赞成功',
        };
      } catch (error) {
        console.error('取消点赞失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '取消点赞失败，请稍后重试',
        });
      }
    }),

  // 获取用户所有点赞的文章 - 受保护的路由
  getLikedPosts: protectedProcedure
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

        // 查询用户的点赞记录，包含文章信息
        const likedPosts = await db.query.postLikes.findMany({
          where: eq(postLikes.userId, user.id),
          limit,
          offset,
          orderBy: (postLikes, { desc }) => [desc(postLikes.createdAt)],
          with: {
            post: {
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
              },
            },
          },
        });

        return {
          success: true,
          likedPosts: likedPosts.map(like => ({
            ...like.post,
            likedAt: like.createdAt, // 添加点赞时间
          })),
        };
      } catch (error) {
        console.error('获取点赞文章列表失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取点赞文章列表失败',
        });
      }
    }),
});

// 导出类型
export type LikeRouter = typeof likeRouter;