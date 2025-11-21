"use client"

import { Post } from "@/model/post"
import { useState } from "react"
import { trpc } from "@/trpc/client"
import { Label } from "@/modules/ai/label/label"


export const PostContent = ({ post }: { post: Post }) => {
    const [translatedContent, setTranslatedContent] = useState<string | null>(null);
    
    // AI翻译 mutation
    const translateMutation = trpc.ai.translate.useMutation();
    
    return(
    <div className="px-4 pt-4 pb-4">
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-3">
            {translatedContent || post.content}
        </p>
        <button
            onClick={() => {
                // 如果已经翻译过，则恢复原文
                if (translatedContent) {
                    setTranslatedContent(null);
                } else {
                    // 否则进行翻译
                    translateMutation.mutate(
                        { text: post.content, targetLang: 'zh' },
                        {
                            onSuccess: (data) => {
                                setTranslatedContent(data.translatedText);
                            }
                        }
                    );
                }
            }}
            className="text-xs text-gray-500 hover:text-blue-500 transition-colors"
        >
            {translatedContent ? '原文' : '翻译'}
        </button>
            
        {/* 标签显示区域 */}
        {post.tags && post.tags.length > 0 && (
            <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                        <Label key={tag.id} name={tag.name} />
                    ))}
                </div>
            </div>
        )}
    </div>
    )
}