import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { posts, users } from '@/db/schema';
import { sql, or, ilike, desc } from 'drizzle-orm';

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

  // AI智能搜索 - 公开路由
  search: baseProcedure
    .input(
      z.object({
        query: z.string().min(1, '搜索内容不能为空'),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .mutation(async ({ input }) => {
      const { query, limit } = input;

      try {
        const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
        const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL;

        if (!DEEPSEEK_API_KEY || !DEEPSEEK_BASE_URL) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'DeepSeek API配置未设置',
          });
        }

        // 1. 使用 AI 扩展搜索关键词
        const keywordExpansionPrompt = `用户搜索关键词："${query}"
分析这个关键词，提供相关的扩展关键词（包括同义词、相关概念、英文等），以JSON数组格式返回。
例如：搜索"篮球"，应返回：["篮球", "basketball", "NBA", "球赛", "投篮", "扣篮", "比赛"]
只返回JSON数组，不要其他内容。最多10个关键词。`;

        const keywordResponse = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'user',
                content: keywordExpansionPrompt,
              },
            ],
            temperature: 0.5,
            max_tokens: 200,
          }),
        });

        let expandedKeywords = [query];
        if (keywordResponse.ok) {
          const keywordData = await keywordResponse.json();
          const keywordText = keywordData.choices?.[0]?.message?.content?.trim();
          try {
            const parsed = JSON.parse(keywordText);
            if (Array.isArray(parsed)) {
              expandedKeywords = [...new Set([query, ...parsed])];
            }
          } catch {
            // 解析失败，使用原关键词
          }
        }

        // 2. 使用扩展关键词进行数据库搜索
        const conditions = expandedKeywords.map(keyword => 
          or(
            ilike(posts.title, `%${keyword}%`),
            ilike(posts.content, `%${keyword}%`)
          )
        );

        const dbResults = await db
          .select({
            id: posts.id,
            title: posts.title,
            content: posts.content,
            createdAt: posts.createdAt,
            authorId: posts.authorId,
            authorUsername: users.username,
            authorAvatar: users.avatar,
          })
          .from(posts)
          .leftJoin(users, sql`${posts.authorId} = ${users.id}`)
          .where(or(...conditions))
          .orderBy(desc(posts.createdAt))
          .limit(limit * 2); // 获取更多结果用于AI排序

        // 3. 使用 AI 对搜索结果进行相关性排序和总结
        const systemPrompt = `你是一个智能搜索助手。用户搜索了「${query}」，我已经从数据库中找到了 ${dbResults.length} 条相关文章。

请完成以下任务：
1. 分析每篇文章与搜索关键词的相关性
2. 按相关性从高到低排序（返回文章ID数组）
3. 提供一个简短的搜索总结（不超过100字）

返回JSON格式：
{
  "sortedIds": ["id1", "id2", ...],
  "summary": "搜索总结文本"
}

如果没有找到结果，summary中请给出友好的提示和搜索建议。`;

        const articlesInfo = dbResults.map(r => 
          `ID: ${r.id}, 标题：${r.title}，内容摘要：${r.content.substring(0, 150)}...`
        ).join('\n');

        // 调用 AI 进行排序和总结
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
                content: articlesInfo || '未找到相关文章',
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        let sortedResults = dbResults;
        let aiSummary = '';
        
        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.choices?.[0]?.message?.content?.trim() || '';
          
          try {
            const parsed = JSON.parse(aiResponse);
            aiSummary = parsed.summary || '';
            
            // 根据AI排序重新排列结果
            if (parsed.sortedIds && Array.isArray(parsed.sortedIds)) {
              const idMap = new Map(dbResults.map(r => [r.id, r]));
              sortedResults = parsed.sortedIds
                .map((id: string) => idMap.get(id))
                .filter(Boolean)
                .slice(0, limit);
            }
          } catch {
            // JSON解析失败，使用原始排序
            aiSummary = aiResponse;
            sortedResults = dbResults.slice(0, limit);
          }
        }

        return {
          success: true,
          query,
          expandedKeywords,
          total: sortedResults.length,
          results: sortedResults.map(r => ({
            id: r.id,
            title: r.title,
            content: r.content,
            createdAt: r.createdAt,
            author: {
              id: r.authorId,
              username: r.authorUsername || '未知用户',
              avatar: r.authorAvatar,
            },
          })),
          aiSummary,
        };
      } catch (error) {
        console.error('AI搜索失败:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'AI搜索失败，请稍后重试',
        });
      }
    }),
});

// 导出类型
export type AiRouter = typeof aiRouter;