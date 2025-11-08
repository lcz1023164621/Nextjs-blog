import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
});

// 导出类型
export type UserRouter = typeof userRouter;