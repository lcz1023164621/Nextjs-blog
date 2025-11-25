import { z } from 'zod';
import { protectedProcedure, createTRPCRouter } from '@/trpc/init';
import { db } from '@/db';
import { follows, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const followRouter = createTRPCRouter({
  // 切换关注状态（智能关注/取消关注）- 受保护的路由
  toggleFollow: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string().uuid('无效的用户ID'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { targetUserId } = input;
      const clerkId = ctx.userId;

      try {
        // 通过 clerkId 查找数据库中的当前用户
        const currentUser = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkId),
        });

        if (!currentUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在，请先完成用户同步',
          });
        }

        // 验证目标用户是否存在
        const targetUser = await db.query.users.findFirst({
          where: eq(users.id, targetUserId),
        });

        if (!targetUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '目标用户不存在',
          });
        }

        // 不能关注自己
        if (currentUser.id === targetUserId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '不能关注自己',
          });
        }

        // 检查是否已经关注
        const existingFollow = await db.query.follows.findFirst({
          where: and(
            eq(follows.followerId, currentUser.id),
            eq(follows.followingId, targetUserId)
          ),
        });

        if (existingFollow) {
          // 已关注，执行取消关注
          await db.delete(follows).where(
            and(
              eq(follows.followerId, currentUser.id),
              eq(follows.followingId, targetUserId)
            )
          );

          return {
            success: true,
            isFollowing: false,
            message: '取消关注成功',
          };
        } else {
          // 未关注，执行关注
          await db.insert(follows)
            .values({
              followerId: currentUser.id,
              followingId: targetUserId,
            });

          return {
            success: true,
            isFollowing: true,
            message: '关注成功',
          };
        }
      } catch (error) {
        console.error('切换关注状态失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '操作失败，请稍后重试',
        });
      }
    }),

  // 关注用户 - 受保护的路由
  followUser: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string().uuid('无效的用户ID'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { targetUserId } = input;
      const clerkId = ctx.userId;

      try {
        // 通过 clerkId 查找数据库中的当前用户
        const currentUser = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkId),
        });

        if (!currentUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在，请先完成用户同步',
          });
        }

        // 验证目标用户是否存在
        const targetUser = await db.query.users.findFirst({
          where: eq(users.id, targetUserId),
        });

        if (!targetUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '目标用户不存在',
          });
        }

        // 不能关注自己
        if (currentUser.id === targetUserId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '不能关注自己',
          });
        }

        // 检查是否已经关注
        const existingFollow = await db.query.follows.findFirst({
          where: and(
            eq(follows.followerId, currentUser.id),
            eq(follows.followingId, targetUserId)
          ),
        });

        if (existingFollow) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '您已经关注过该用户',
          });
        }

        // 添加关注记录
        const newFollow = await db.insert(follows)
          .values({
            followerId: currentUser.id,
            followingId: targetUserId,
          })
          .returning();

        return {
          success: true,
          follow: newFollow[0],
          message: '关注成功',
        };
      } catch (error) {
        console.error('关注失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '关注失败，请稍后重试',
        });
      }
    }),

  // 取消关注 - 受保护的路由
  unfollowUser: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string().uuid('无效的用户ID'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { targetUserId } = input;
      const clerkId = ctx.userId;

      try {
        // 通过 clerkId 查找数据库中的当前用户
        const currentUser = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkId),
        });

        if (!currentUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }

        // 查找关注记录
        const existingFollow = await db.query.follows.findFirst({
          where: and(
            eq(follows.followerId, currentUser.id),
            eq(follows.followingId, targetUserId)
          ),
        });

        if (!existingFollow) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '您还未关注该用户',
          });
        }

        // 删除关注记录
        await db.delete(follows).where(
          and(
            eq(follows.followerId, currentUser.id),
            eq(follows.followingId, targetUserId)
          )
        );

        return {
          success: true,
          message: '取消关注成功',
        };
      } catch (error) {
        console.error('取消关注失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '取消关注失败，请稍后重试',
        });
      }
    }),

  // 获取我关注的用户列表 - 受保护的路由
  getFollowing: protectedProcedure
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
        // 通过 clerkId 查找数据库中的当前用户
        const currentUser = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkId),
        });

        if (!currentUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }

        // 查询关注列表，包含用户信息
        const followingList = await db.query.follows.findMany({
          where: eq(follows.followerId, currentUser.id),
          limit,
          offset,
          orderBy: (follows, { desc }) => [desc(follows.createdAt)],
          with: {
            following: {
              columns: {
                id: true,
                username: true,
                avatar: true,
                bio: true,
              },
            },
          },
        });

        return {
          success: true,
          following: followingList.map(follow => ({
            ...follow.following,
            followedAt: follow.createdAt,
          })),
        };
      } catch (error) {
        console.error('获取关注列表失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取关注列表失败',
        });
      }
    }),

  // 获取关注我的用户列表（粉丝列表）- 受保护的路由
  getFollowers: protectedProcedure
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
        // 通过 clerkId 查找数据库中的当前用户
        const currentUser = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkId),
        });

        if (!currentUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }

        // 查询粉丝列表，包含用户信息
        const followersList = await db.query.follows.findMany({
          where: eq(follows.followingId, currentUser.id),
          limit,
          offset,
          orderBy: (follows, { desc }) => [desc(follows.createdAt)],
          with: {
            follower: {
              columns: {
                id: true,
                username: true,
                avatar: true,
                bio: true,
              },
            },
          },
        });

        return {
          success: true,
          followers: followersList.map(follow => ({
            ...follow.follower,
            followedAt: follow.createdAt,
          })),
        };
      } catch (error) {
        console.error('获取粉丝列表失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取粉丝列表失败',
        });
      }
    }),

  // 检查是否关注某个用户 - 受保护的路由
  checkFollowStatus: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string().uuid('无效的用户ID'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { targetUserId } = input;
      const clerkId = ctx.userId;

      try {
        // 通过 clerkId 查找数据库中的当前用户
        const currentUser = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkId),
        });

        if (!currentUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }

        // 检查是否已关注
        const existingFollow = await db.query.follows.findFirst({
          where: and(
            eq(follows.followerId, currentUser.id),
            eq(follows.followingId, targetUserId)
          ),
        });

        return {
          success: true,
          isFollowing: !!existingFollow,
        };
      } catch (error) {
        console.error('检查关注状态失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '检查关注状态失败',
        });
      }
    }),

  // 获取用户的关注和粉丝统计 - 受保护的路由
  getFollowStats: protectedProcedure
    .query(async ({ ctx }) => {
      const clerkId = ctx.userId;

      try {
        // 通过 clerkId 查找数据库中的当前用户
        const currentUser = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkId),
        });

        if (!currentUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }

        // 获取关注数
        const followingList = await db.query.follows.findMany({
          where: eq(follows.followerId, currentUser.id),
        });

        // 获取粉丝数
        const followersList = await db.query.follows.findMany({
          where: eq(follows.followingId, currentUser.id),
        });

        return {
          success: true,
          stats: {
            followingCount: followingList.length,
            followersCount: followersList.length,
          },
        };
      } catch (error) {
        console.error('获取关注统计失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取关注统计失败',
        });
      }
    }),
});

// 导出类型
export type FollowRouter = typeof followRouter;
