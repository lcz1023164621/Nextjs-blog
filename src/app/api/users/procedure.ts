import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { db } from '@/db';
import { users, posts } from '@/db/schema';
import { eq, sql, inArray } from 'drizzle-orm';
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

  // 获取用户信息 - 受保护的路由
  getUserInfo: protectedProcedure
    .query(async ({ ctx }) => {
      const clerkId = ctx.userId;

      try {
        // 通过 clerkId 查找数据库中的用户
        const user = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkId),
          columns: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
            email: true,
            createdAt: true,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }

        // 获取关注数和粉丝数
        const { follows, postLikes } = await import('@/db/schema');
        
        const followingList = await db.query.follows.findMany({
          where: eq(follows.followerId, user.id),
        });

        const followersList = await db.query.follows.findMany({
          where: eq(follows.followingId, user.id),
        });

        // 获取用户所有文章收到的总点赞数
        const userPostsResult = await db.query.posts.findMany({
          where: eq(posts.authorId, user.id),
          columns: {
            id: true,
          },
        });

        let totalLikes = 0;
        if (userPostsResult.length > 0) {
          const postIds = userPostsResult.map(p => p.id);
          const likesResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(postLikes)
            .where(inArray(postLikes.postId, postIds));
          totalLikes = Number(likesResult[0]?.count || 0);
        }

        return {
          success: true,
          user,
          stats: {
            followingCount: followingList.length,
            followersCount: followersList.length,
            totalLikes,
          },
        };
      } catch (error) {
        console.error('获取用户信息失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取用户信息失败',
        });
      }
    }),

  // 更新用户简介 - 受保护的路由
  updateUserBio: protectedProcedure
    .input(
      z.object({
        bio: z.string().max(500, '简介不能超过500字').optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const clerkId = ctx.userId;
      const { bio } = input;

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

        // 更新用户简介
        const updatedUser = await db.update(users)
          .set({
            bio,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, clerkId))
          .returning();

        return {
          success: true,
          message: '简介更新成功',
          user: updatedUser[0],
        };
      } catch (error) {
        console.error('更新用户简介失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '更新用户简介失败',
        });
      }
    }),

  // 根据用户ID获取用户信息及统计 - 公开路由
  getUserById: baseProcedure
    .input(
      z.object({
        userId: z.string().uuid('无效的用户ID'),
      })
    )
    .query(async ({ input }) => {
      const { userId } = input;

      try {
        // 查找用户
        const user = await db.query.users.findFirst({
          where: eq(users.id, userId),
          columns: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
            email: true,
            createdAt: true,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }

        // 获取关注数和粉丝数
        const { follows } = await import('@/db/schema');
        
        const followingList = await db.query.follows.findMany({
          where: eq(follows.followerId, userId),
        });

        const followersList = await db.query.follows.findMany({
          where: eq(follows.followingId, userId),
        });

        return {
          success: true,
          ...user,
          followingCount: followingList.length,
          followersCount: followersList.length,
        };
      } catch (error) {
        console.error('获取用户信息失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取用户信息失败',
        });
      }
    }),

  // 根据用户ID获取用户发表的文章 - 公开路由
  getUserPostsByUserId: baseProcedure
    .input(
      z.object({
        userId: z.string().uuid('无效的用户ID'),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
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

        // 查询用户发表的文章
        const userPosts = await db.query.posts.findMany({
          where: eq(posts.authorId, userId),
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
            likes: true,
          },
        });

        // 获取当前登录用户的ID（如果已登录）
        let currentUserId: string | null = null;
        if (ctx.userId) {
          const currentUser = await db.query.users.findFirst({
            where: eq(users.clerkId, ctx.userId),
          });
          currentUserId = currentUser?.id || null;
        }

        // 为每篇文章添加点赞状态和统计
        const postsWithLikeStatus = userPosts.map(post => {
          const isLiked = currentUserId
            ? post.likes.some(like => like.userId === currentUserId)
            : false;
          
          return {
            ...post,
            likesCount: post.likes.length,
            isLiked,
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