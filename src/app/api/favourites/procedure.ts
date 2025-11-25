import { z } from 'zod';
import { protectedProcedure, createTRPCRouter, baseProcedure } from '@/trpc/init';
import { db } from '@/db';
import { postFavorites, users, posts, postLikes } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const favoritesRouter = createTRPCRouter({
  // 切换收藏状态（智能收藏/取消收藏）- 受保护的路由
  toggleFavorite: protectedProcedure
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

        // 检查是否已经收藏
        const existingFavorite = await db.query.postFavorites.findFirst({
          where: and(
            eq(postFavorites.postId, postId),
            eq(postFavorites.userId, user.id)
          ),
        });

        if (existingFavorite) {
          // 已收藏，执行取消收藏
          await db.delete(postFavorites).where(
            and(
              eq(postFavorites.postId, postId),
              eq(postFavorites.userId, user.id)
            )
          );

          return {
            success: true,
            isFavorited: false,
            message: '取消收藏成功',
          };
        } else {
          // 未收藏，执行收藏
          await db.insert(postFavorites)
            .values({
              postId,
              userId: user.id,
            });

          return {
            success: true,
            isFavorited: true,
            message: '收藏成功',
          };
        }
      } catch (error) {
        console.error('切换收藏状态失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '操作失败，请稍后重试',
        });
      }
    }),

  // 收藏文章 - 受保护的路由
  favouritesPost: protectedProcedure
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

        // 检查是否已经收藏
        const existingFavorite = await db.query.postFavorites.findFirst({
          where: and(
            eq(postFavorites.postId, postId),
            eq(postFavorites.userId, user.id)
          ),
        });

        if (existingFavorite) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '您已经收藏过此文章',
          });
        }

        // 添加收藏记录
        const newFavorite = await db.insert(postFavorites)
          .values({
            postId,
            userId: user.id,
          })
          .returning();

        return {
          success: true,
          favorite: newFavorite[0],
          message: '收藏成功',
        };
      } catch (error) {
        console.error('收藏失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '收藏失败，请稍后重试',
        });
      }
    }),

  // 取消点赞 - 受保护的路由
  unfavouritesPost: protectedProcedure
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

        // 查找收藏记录
        const existingFavorite = await db.query.postFavorites.findFirst({
          where: and(
            eq(postFavorites.postId, postId),
            eq(postFavorites.userId, user.id)
          ),
        });

        if (!existingFavorite) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '您还未收藏此文章',
          });
        }

        // 删除收藏记录
        await db.delete(postFavorites).where(
          and(
            eq(postFavorites.postId, postId),
            eq(postFavorites.userId, user.id)
          )
        );

        return {
          success: true,
          message: '取消收藏成功',
        };
      } catch (error) {
        console.error('取消收藏失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '取消收藏失败，请稍后重试',
        });
      }
    }),

  // 获取用户所有收藏的文章 - 受保护的路由
  getFavoritedPosts: protectedProcedure
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

        // 查询用户的收藏记录，包含文章信息
        const favoritedPosts = await db.query.postFavorites.findMany({
          where: eq(postFavorites.userId, user.id),
          limit,
          offset,
          orderBy: (postFavorites, { desc }) => [desc(postFavorites.createdAt)],
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

        // 为每篇文章添加统计数据
        const postsWithStats = await Promise.all(
          favoritedPosts.map(async (favorite) => {
            const post = favorite.post;

            // 统计点赞数
            const likesCountResult = await db
              .select({ count: sql<number>`count(*)` })
              .from(postLikes)
              .where(eq(postLikes.postId, post.id));
            const likesCount = Number(likesCountResult[0]?.count || 0);

            // 统计收藏数
            const favoritesCountResult = await db
              .select({ count: sql<number>`count(*)` })
              .from(postFavorites)
              .where(eq(postFavorites.postId, post.id));
            const favoritesCount = Number(favoritesCountResult[0]?.count || 0);

            return {
              ...post,
              likesCount,
              favoritesCount,
              favoritedAt: favorite.createdAt, // 添加收藏时间
            };
          })
        );

        return {
          success: true,
          favoritedPosts: postsWithStats,
        };
      } catch (error) {
        console.error('获取收藏文章列表失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取收藏文章列表失败',
        });
      }
    }),

  // 根据用户ID获取收藏的文章 - 公开路由
  getFavoritedPostsByUserId: baseProcedure
    .input(
      z.object({
        userId: z.string().uuid('无效的用户ID'),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const { userId, limit, offset } = input;

      try {
        // 查找用户
        const user = await db.query.users.findFirst({
          where: eq(users.id, userId),
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }

        // 查询用户的收藏记录，包含文章信息
        const favoritedPosts = await db.query.postFavorites.findMany({
          where: eq(postFavorites.userId, userId),
          limit,
          offset,
          orderBy: (postFavorites, { desc }) => [desc(postFavorites.createdAt)],
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

        // 为每篇文章添加统计数据
        const postsWithStats = await Promise.all(
          favoritedPosts.map(async (favorite) => {
            const post = favorite.post;

            // 统计点赞数
            const likesCountResult = await db
              .select({ count: sql<number>`count(*)` })
              .from(postLikes)
              .where(eq(postLikes.postId, post.id));
            const likesCount = Number(likesCountResult[0]?.count || 0);

            // 统计收藏数
            const favoritesCountResult = await db
              .select({ count: sql<number>`count(*)` })
              .from(postFavorites)
              .where(eq(postFavorites.postId, post.id));
            const favoritesCount = Number(favoritesCountResult[0]?.count || 0);

            return {
              ...post,
              likesCount,
              favoritesCount,
              favoritedAt: favorite.createdAt,
            };
          })
        );

        return {
          success: true,
          favoritedPosts: postsWithStats,
        };
      } catch (error) {
        console.error('获取收藏文章列表失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取收藏文章列表失败',
        });
      }
    }),
});

// 导出类型
export type FavoritesRouter = typeof favoritesRouter;