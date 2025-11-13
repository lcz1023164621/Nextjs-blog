import { z } from 'zod';
import { protectedProcedure, createTRPCRouter, baseProcedure } from '@/trpc/init';
import { db } from '@/db';
import { comments, users, posts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const CommentRouter = createTRPCRouter({
  // 创建评论 - 受保护的路由
  createComment: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1, '评论内容不能为空').max(1000, '评论最多1000个字符'),
        postId: z.string().uuid('无效的文章ID'),
        parentId: z.string().uuid('无效的父评论ID').optional(), // 可选，用于回复其他评论
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { content, postId, parentId } = input;
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

        // 如果是回复评论，验证父评论是否存在
        if (parentId) {
          const parentComment = await db.query.comments.findFirst({
            where: eq(comments.id, parentId),
          });

          if (!parentComment) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: '父评论不存在',
            });
          }

          // 确保父评论属于同一篇文章
          if (parentComment.postId !== postId) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: '父评论与文章不匹配',
            });
          }
        }

        // 创建评论
        const newComment = await db.insert(comments)
          .values({
            content,
            postId,
            authorId: user.id,
            parentId: parentId || null,
          })
          .returning();

        return {
          success: true,
          comment: newComment[0],
        };
      } catch (error) {
        console.error('创建评论失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '创建评论失败，请稍后重试',
        });
      }
    }),

  // 获取文章的评论列表
  getCommentsByPostId: baseProcedure
    .input(
      z.object({
        postId: z.string().uuid('无效的文章ID'),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const { postId, limit, offset } = input;

      try {
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

        // 查询评论，包含作者信息和回复
        const commentList = await db.query.comments.findMany({
          where: eq(comments.postId, postId),
          limit,
          offset,
          orderBy: (comments, { desc }) => [desc(comments.createdAt)],
          with: {
            author: {
              columns: {
                id: true,
                username: true,
                avatar: true,
                clerkId: true,
              },
            },
            replies: {
              with: {
                author: {
                  columns: {
                    id: true,
                    username: true,
                    avatar: true,
                    clerkId: true,
                  },
                },
              },
              orderBy: (comments, { asc }) => [asc(comments.createdAt)],
            },
          },
        });

        return {
          success: true,
          comments: commentList,
        };
      } catch (error) {
        console.error('获取评论列表失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取评论列表失败',
        });
      }
    }),

  // 删除评论 - 受保护的路由（仅作者可删除）
  deleteComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string().uuid('无效的评论ID'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const clerkId = ctx.userId;

      try {
        // 查找当前用户
        const user = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkId),
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '用户不存在',
          });
        }

        // 查找评论
        const comment = await db.query.comments.findFirst({
          where: eq(comments.id, commentId),
        });

        if (!comment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '评论不存在',
          });
        }

        // 验证是否是评论作者
        if (comment.authorId !== user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '无权删除此评论',
          });
        }

        // 删除评论（级联删除会自动删除子评论）
        await db.delete(comments).where(eq(comments.id, commentId));

        return {
          success: true,
          message: '评论已删除',
        };
      } catch (error) {
        console.error('删除评论失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '删除评论失败',
        });
      }
    }),
});

// 导出类型
export type CommentRouter = typeof CommentRouter;