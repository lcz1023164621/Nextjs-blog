import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { TRPCError } from '@trpc/server';

export const aiRouter = createTRPCRouter({
  // AI翻译 - 公开路由
  translate: baseProcedure
    .input(
      z.object({
        text: z.string().min(1, '翻译内容不能为空'),
        targetLang: z.enum(['en', 'zh']).default('zh'), // 目标语言：英文或中文
      })
    )
    .mutation(async ({ input }) => {
      const { text, targetLang } = input;

      try {
        const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
        const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL;

        if (!DEEPSEEK_API_KEY || !DEEPSEEK_BASE_URL) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'DeepSeek API配置未设置',
          });
        }

        // 构建翻译提示词
        const systemPrompt = targetLang === 'zh' 
          ? '你是一个专业的翻译助手，请将以下文本翻译成中文。只返回翻译结果，不要添加任何解释或额外内容。'
          : '你是一个专业的翻译助手，请将以下文本翻译成英文。只返回翻译结果，不要添加任何解释或额外内容。';

        // 调用 DeepSeek API
        const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
              {
                role: 'user',
                content: text,
              },
            ],
            temperature: 0.3, // 较低的温度以获得更准确的翻译
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `DeepSeek API调用失败: ${errorData.error?.message || response.statusText}`,
          });
        }

        const data = await response.json();
        const translatedText = data.choices?.[0]?.message?.content;

        if (!translatedText) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '翻译结果为空',
          });
        }

        return {
          success: true,
          originalText: text,
          translatedText: translatedText.trim(),
          targetLang,
        };
      } catch (error) {
        console.error('AI翻译失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'AI翻译失败，请稍后重试',
        });
      }
    }),
});

// 导出类型
export type AiRouter = typeof aiRouter;