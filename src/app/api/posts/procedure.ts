import { z } from 'zod';
import { protectedProcedure, createTRPCRouter, baseProcedure } from '@/trpc/init';
import { db } from '@/db';
import { posts, users, postImages, postLikes, postFavorites, comments } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const postRouter = createTRPCRouter({
  // 上传图片 - 受保护的路由
  uploadImage: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
        base64Data: z.string(), // base64 编码的图片数据
      })
    )
    .mutation(async ({ input }) => {
      const { fileName, fileType, base64Data } = input;

      try {
        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(fileType)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '不支持的文件类型，仅支持 JPEG, PNG, GIF, WebP',
          });
        }

        // 验证文件大小 (5MB)
        const buffer = Buffer.from(base64Data, 'base64');
        const maxSize = 5 * 1024 * 1024;
        if (buffer.length > maxSize) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '文件过大，最大支持 5MB',
          });
        }

        // 生成唯一文件名
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const ext = path.extname(fileName);
        const filename = `${timestamp}-${randomStr}${ext}`;

        // 创建上传目录
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch {
          // 目录已存在，忽略错误
        }

        // 保存文件
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // 返回完整 URL
        const url = `http://localhost:3000/uploads/${filename}`;

        return {
          success: true,
          url,
          filename,
        };
      } catch (error) {
        console.error('图片上传失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '图片上传失败',
        });
      }
    }),

  // 创建文章 - 受保护的路由
  createPost: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, '标题不能为空').max(200, '标题最多200个字符'),
        content: z.string().min(1, '内容不能为空'),
        imageUrls: z.array(z.string().url()).optional(), // 图片URL数组
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { title, content, imageUrls } = input;
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

        // 如果有图片，插入到 postImages 表
        if (imageUrls && imageUrls.length > 0) {
          await db.insert(postImages).values(
            imageUrls.map(url => ({
              postId: newPost[0].id,
              imageUrl: url,
            }))
          );
        }

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

  // 获取文章列表
  getPosts: baseProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10), //每页显示的文章数量
        offset: z.number().min(0).default(0), //分页偏移
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      const { limit = 10, offset = 0 } = input || {};
      const clerkId = ctx.userId; // 获取当前登录用户的 clerkId（可能为 null）

      try {
        // 查询文章，包含作者和图片信息
        const postList = await db.query.posts.findMany({
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
          },
        });

        // 如果用户已登录，查询点赞和收藏状态
        let currentUser = null;
        if (clerkId) {
          currentUser = await db.query.users.findFirst({
            where: eq(users.clerkId, clerkId),
          });
        }

        // 为每篇文章添加点赞、收藏状态和统计数据
        const postsWithStatus = await Promise.all(
          postList.map(async (post) => {
            let isLiked = false;
            let isFavorited = false;

            if (currentUser) {
              // 查询是否点赞
              const likeRecord = await db.query.postLikes.findFirst({
                where: and(
                  eq(postLikes.postId, post.id),
                  eq(postLikes.userId, currentUser.id)
                ),
              });
              isLiked = !!likeRecord;

              // 查询是否收藏
              const favoriteRecord = await db.query.postFavorites.findFirst({
                where: and(
                  eq(postFavorites.postId, post.id),
                  eq(postFavorites.userId, currentUser.id)
                ),
              });
              isFavorited = !!favoriteRecord;
            }

            // 统计评论数（包括所有层级的评论）
            const commentsCountResult = await db
              .select({ count: sql<number>`count(*)` })
              .from(comments)
              .where(eq(comments.postId, post.id));
            const commentsCount = Number(commentsCountResult[0]?.count || 0);

            return {
              ...post,
              isLiked,
              isFavorited,
              commentsCount,
            };
          })
        );

        return {
          success: true,
          posts: postsWithStatus,
        };
      } catch (error) {
        console.error('获取文章列表失败:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取文章列表失败',
        });
      }
    }),

    //根据id获取文章信息
    getPostById:baseProcedure
    .input(
        z.object(
            { id: z.string() }
        )
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const clerkId = ctx.userId; // 获取当前登录用户的 clerkId（可能为 null）

      try{
        const post = await db.query.posts.findFirst({
          where: eq(posts.id, id),
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
        });

        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '文章不存在',
          });
        }

        // 统计点赞数
        const likesCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(postLikes)
          .where(eq(postLikes.postId, id));
        const likesCount = Number(likesCountResult[0]?.count || 0);

        // 统计收藏数
        const favoritesCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(postFavorites)
          .where(eq(postFavorites.postId, id));
        const favoritesCount = Number(favoritesCountResult[0]?.count || 0);

        // 统计评论数（包括所有层级的评论）
        const commentsCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(comments)
          .where(eq(comments.postId, id));
        const commentsCount = Number(commentsCountResult[0]?.count || 0);

        // 如果用户已登录，查询点赞和收藏状态
        let isLiked = false;
        let isFavorited = false;
        
        if (clerkId) {
          const currentUser = await db.query.users.findFirst({
            where: eq(users.clerkId, clerkId),
          });

          if (currentUser) {
            // 查询是否点赞
            const likeRecord = await db.query.postLikes.findFirst({
              where: and(
                eq(postLikes.postId, id),
                eq(postLikes.userId, currentUser.id)
              ),
            });
            isLiked = !!likeRecord;

            // 查询是否收藏
            const favoriteRecord = await db.query.postFavorites.findFirst({
              where: and(
                eq(postFavorites.postId, id),
                eq(postFavorites.userId, currentUser.id)
              ),
            });
            isFavorited = !!favoriteRecord;
          }
        }

        return { 
          success: true, 
          post: {
            ...post,
            likesCount,
            favoritesCount,
            commentsCount,
            isLiked,
            isFavorited,
          }
        };
      }
      catch(error){
        console.error('获取文章失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取文章失败',
        });
      }
    })
});

// 导出类型
export type PostRouter = typeof postRouter;