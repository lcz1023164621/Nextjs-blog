import { z } from 'zod';
import { protectedProcedure, createTRPCRouter, baseProcedure } from '@/trpc/init';
import { db } from '@/db';
import { posts, users, postImages, postLikes, postFavorites, comments, tags, postTags } from '@/db/schema';
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
        imageUrls: z.array(z.string().url()).optional().default([]), // 图片为可选，默认空数组
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

        // 插入图片到 postImages 表（仅当有图片时）
        if (imageUrls && imageUrls.length > 0) {
          await db.insert(postImages).values(
            imageUrls.map(url => ({
              postId: newPost[0].id,
              imageUrl: url,
            }))
          );
        }

        // 使用 AI 生成标签
        try {
          const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
          const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL;

          if (DEEPSEEK_API_KEY && DEEPSEEK_BASE_URL) {
            const systemPrompt = `你是一个专业的内容分析助手，请根据文章标题和内容，提取或生成最相关的标签。

要求：
1. 标签应该简洁明了，每个标签2-6个字符
2. 标签要准确反映文章的主题、领域、技术点或关键概念
3. 优先提取文章中直接提到的关键词
4. 可以适当生成归纳性的标签
5. 返回5个以内的标签
6. 以JSON数组格式返回，例如：["标签1", "标签2", "标签3"]
7. 只返回JSON数组，不要其他内容`;

            const userPrompt = `标题：${title}\n\n内容：${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`;

            const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
              },
              body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt },
                ],
                temperature: 0.5,
                max_tokens: 200,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              const aiResponse = data.choices?.[0]?.message?.content?.trim();
              
              if (aiResponse) {
                let generatedTags: string[] = [];
                try {
                  generatedTags = JSON.parse(aiResponse);
                  if (Array.isArray(generatedTags)) {
                    generatedTags = generatedTags
                      .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
                      .map(tag => tag.trim())
                      .slice(0, 5);
                  }
                } catch {
                  const matches = aiResponse.match(/"([^"]+)"/g);
                  if (matches) {
                    generatedTags = matches.map((m: string) => m.replace(/"/g, '').trim()).slice(0, 5);
                  }
                }

                // 为每个标签创建或查找标签记录，并关联到文章
                for (const tagName of generatedTags) {
                  // 查找或创建标签
                  let tag = await db.query.tags.findFirst({
                    where: eq(tags.name, tagName),
                  });

                  if (!tag) {
                    const newTag = await db.insert(tags)
                      .values({ name: tagName })
                      .returning();
                    tag = newTag[0];
                  }

                  // 创建文章-标签关联
                  await db.insert(postTags).values({
                    postId: newPost[0].id,
                    tagId: tag.id,
                  });
                }
              }
            }
          }
        } catch (tagError) {
          console.error('生成标签失败，但文章创建成功:', tagError);
          // 标签生成失败不影响文章创建
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
        // 查询文章，包含作者、图片和标签信息
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
            postTags: {
              with: {
                tag: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
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

            // 统计评论数（包括所有层级的评论）
            const commentsCountResult = await db
              .select({ count: sql<number>`count(*)` })
              .from(comments)
              .where(eq(comments.postId, post.id));
            const commentsCount = Number(commentsCountResult[0]?.count || 0);

            return {
              id: post.id,
              title: post.title,
              content: post.content,
              createdAt: post.createdAt,
              updatedAt: post.updatedAt,
              author: post.author,
              images: post.images,
              isLiked,
              isFavorited,
              likesCount,
              favoritesCount,
              commentsCount,
              tags: post.postTags.map(pt => pt.tag),
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
            postTags: {
              with: {
                tag: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
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
            tags: post.postTags.map(pt => pt.tag),
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
    }),

  // 获取文章的点赞和收藏总数 - 公开路由
  getPostStats: baseProcedure
    .input(
      z.object({
        postId: z.string().uuid('无效的文章ID'),
      })
    )
    .query(async ({ input }) => {
      const { postId } = input;

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

        // 统计点赞数
        const likesCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(postLikes)
          .where(eq(postLikes.postId, postId));
        const likesCount = Number(likesCountResult[0]?.count || 0);

        // 统计收藏数
        const favoritesCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(postFavorites)
          .where(eq(postFavorites.postId, postId));
        const favoritesCount = Number(favoritesCountResult[0]?.count || 0);

        // 统计评论数
        const commentsCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(comments)
          .where(eq(comments.postId, postId));
        const commentsCount = Number(commentsCountResult[0]?.count || 0);

        return {
          success: true,
          stats: {
            likesCount,
            favoritesCount,
            commentsCount,
            totalInteractions: likesCount + favoritesCount, // 总互动数（点赞+收藏）
          },
        };
      } catch (error) {
        console.error('获取文章统计信息失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取文章统计信息失败',
        });
      }
    }),

  // 删除文章 - 受保护的路由
  deletePost: protectedProcedure
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

        // 查询文章是否存在
        const post = await db.query.posts.findFirst({
          where: eq(posts.id, postId),
        });

        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '文章不存在',
          });
        }

        // 验证是否为文章作者
        if (post.authorId !== user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '您没有权限删除此文章',
          });
        }

        // 删除关联的图片记录
        await db.delete(postImages).where(eq(postImages.postId, postId));

        // 删除关联的点赞记录
        await db.delete(postLikes).where(eq(postLikes.postId, postId));

        // 删除关联的收藏记录
        await db.delete(postFavorites).where(eq(postFavorites.postId, postId));

        // 删除关联的评论记录
        await db.delete(comments).where(eq(comments.postId, postId));

        // 删除文章
        await db.delete(posts).where(eq(posts.id, postId));

        return {
          success: true,
          message: '文章删除成功',
        };
      } catch (error) {
        console.error('删除文章失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '删除文章失败，请稍后重试',
        });
      }
    }),

  // 根据标签名获取文章列表 - 公开路由
  getPostsByTag: baseProcedure
    .input(
      z.object({
        tagName: z.string().min(1, '标签名不能为空'),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const { tagName, limit } = input;
      const clerkId = ctx.userId;

      try {
        // 查找标签
        const tag = await db.query.tags.findFirst({
          where: eq(tags.name, tagName),
        });

        if (!tag) {
          return {
            success: true,
            posts: [],
            tag: { name: tagName },
          };
        }

        // 查询该标签关联的文章
        const postTagsList = await db.query.postTags.findMany({
          where: eq(postTags.tagId, tag.id),
          limit,
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
                postTags: {
                  with: {
                    tag: {
                      columns: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        // 提取文章并添加统计数据
        let currentUser = null;
        if (clerkId) {
          currentUser = await db.query.users.findFirst({
            where: eq(users.clerkId, clerkId),
          });
        }

        const postsWithStatus = await Promise.all(
          postTagsList.map(async (pt) => {
            const post = pt.post;
            let isLiked = false;
            let isFavorited = false;

            if (currentUser) {
              const likeRecord = await db.query.postLikes.findFirst({
                where: and(
                  eq(postLikes.postId, post.id),
                  eq(postLikes.userId, currentUser.id)
                ),
              });
              isLiked = !!likeRecord;

              const favoriteRecord = await db.query.postFavorites.findFirst({
                where: and(
                  eq(postFavorites.postId, post.id),
                  eq(postFavorites.userId, currentUser.id)
                ),
              });
              isFavorited = !!favoriteRecord;
            }

            // 统计数据
            const likesCountResult = await db
              .select({ count: sql<number>`count(*)` })
              .from(postLikes)
              .where(eq(postLikes.postId, post.id));
            const likesCount = Number(likesCountResult[0]?.count || 0);

            const favoritesCountResult = await db
              .select({ count: sql<number>`count(*)` })
              .from(postFavorites)
              .where(eq(postFavorites.postId, post.id));
            const favoritesCount = Number(favoritesCountResult[0]?.count || 0);

            const commentsCountResult = await db
              .select({ count: sql<number>`count(*)` })
              .from(comments)
              .where(eq(comments.postId, post.id));
            const commentsCount = Number(commentsCountResult[0]?.count || 0);

            return {
              ...post,
              isLiked,
              isFavorited,
              likesCount,
              favoritesCount,
              commentsCount,
              tags: post.postTags.map(pt => pt.tag),
            };
          })
        );

        return {
          success: true,
          posts: postsWithStatus,
          tag: { id: tag.id, name: tag.name },
        };
      } catch (error) {
        console.error('获取标签文章失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取标签文章失败',
        });
      }
    }),

  // 检查文章是否属于当前用户 - 受保护的路由
  checkPostOwnership: protectedProcedure
    .input(
      z.object({
        postId: z.string().uuid('无效的文章ID'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { postId } = input;
      const clerkId = ctx.userId;

      try {
        // 通过 clerkId 查找数据库中的用户
        const user = await db.query.users.findFirst({
          where: eq(users.clerkId, clerkId),
        });

        if (!user) {
          return {
            success: true,
            isOwner: false,
          };
        }

        // 查询文章是否存在
        const post = await db.query.posts.findFirst({
          where: eq(posts.id, postId),
        });

        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '文章不存在',
          });
        }

        // 检查是否为文章作者
        return {
          success: true,
          isOwner: post.authorId === user.id,
        };
      } catch (error) {
        console.error('检查文章所有权失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '检查文章所有权失败',
        });
      }
    })
});

// 导出类型
export type PostRouter = typeof postRouter;