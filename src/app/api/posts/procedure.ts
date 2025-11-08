import { z } from 'zod';
import { protectedProcedure, createTRPCRouter } from '@/trpc/init';
import { db } from '@/db';
import { posts, users, postImages } from '@/db/schema';
import { eq } from 'drizzle-orm';
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
});

// 导出类型
export type PostRouter = typeof postRouter;