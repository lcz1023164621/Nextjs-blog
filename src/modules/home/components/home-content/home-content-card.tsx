'use client';

import { MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { LikesButton } from '@/modules/likes/components/likes-button';
import { FavouritesButton } from '@/modules/favourites/component/favourites-button';
import { ShowMore } from '../showmore/showmore';
import { HomeContentShare } from './home-content-share';
import { Label } from '@/modules/ai/label/label';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface TextContentCardProps {
  id: string;
  title: string;
  content: string;
  thumbnail?: string;
  author: {
    name: string;
  };
  stats: {
    comments: number;
    isFavorited?: boolean;
    isLiked?: boolean;
    likesCount?: number;
    favoritesCount?: number;
  };
  tags?: Array<{
    id: string;
    name: string;
  }>;
  onLikeChange?: (isLiked: boolean) => void;
  onFavoriteChange?: (isFavorited: boolean) => void;
  onDeleteSuccess?: () => void;
}

export type { TextContentCardProps };

export const HomeContentCard = ({ 
  title, 
  content, 
  thumbnail,
  author,
  stats,
  id,
  tags,
  onLikeChange,
  onFavoriteChange,
  onDeleteSuccess,
}: TextContentCardProps) => {
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isShowingTranslation, setIsShowingTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleTranslate = async () => {
    if (isTranslating) return;
    
    setIsTranslating(true);
    try {
      // 分别翻译标题和内容
      const [titleResponse, contentResponse] = await Promise.all([
        fetch('/api/trpc/ai.translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            json: { text: title, targetLang: 'zh' }
          })
        }),
        fetch('/api/trpc/ai.translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            json: { text: content, targetLang: 'zh' }
          })
        })
      ]);
      
      const [titleResult, contentResult] = await Promise.all([
        titleResponse.json(),
        contentResponse.json()
      ]);
      
      if (titleResult.result?.data?.json?.translatedText) {
        setTranslatedTitle(titleResult.result.data.json.translatedText);
      }
      
      if (contentResult.result?.data?.json?.translatedText) {
        setTranslatedContent(contentResult.result.data.json.translatedText);
      }
      
      if (titleResult.result?.data?.json?.translatedText && contentResult.result?.data?.json?.translatedText) {
        setIsShowingTranslation(true);
      }
    } catch (error) {
      console.error('翻译失败:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleTranslation = () => {
    if (translatedContent && translatedTitle) {
      setIsShowingTranslation(!isShowingTranslation);
    }
  };

  return (

    <Card className="p-4 hover:bg-accent/5 transition-colors border-b rounded-lg">
      {/* 标题 */}
    <Link href={`/post/${id}`}>
      <h3 className="text-[20px] font-medium mb-3 leading-relaxed">
        {isShowingTranslation && translatedTitle ? translatedTitle : title}
      </h3>
    </Link>
    
      <div className="flex gap-3">
        {/* 左侧缩略图(可选) */}
        {thumbnail && (
          <div className="w-[120px] h-20 rounded flex-shrink-0 overflow-hidden bg-gray-100">
            {thumbnail.endsWith('.svg') ? (
              <img 
                src={thumbnail} 
                alt={title}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <Image 
                src={thumbnail} 
                alt={title}
                width={120}
                height={80}
                className="w-full h-full object-cover"
                sizes="120px"
              />
            )}
          </div>
        )}


        {/* 内容区域 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <p className="text-[15px] text-gray-700 leading-[1.7] line-clamp-3 flex-1">
              {isShowingTranslation && translatedContent ? translatedContent : content}
            </p>
            <div className="flex flex-col gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTranslate}
                disabled={isTranslating}
                className="h-7 px-2"
              >
                {isTranslating ? '翻译中...' : '翻译'}
              </Button>
              {translatedContent && translatedTitle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTranslation}
                  className="h-7 px-2 text-xs text-gray-600"
                >
                  {isShowingTranslation ? '原文' : '译文'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 标签 */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map(tag => (
            <Label key={tag.id} name={tag.name} />
          ))}
        </div>
      )}

      {/* 底部互动栏 */}
      <div className="flex items-center gap-5 mt-4 text-[13px] text-gray-500">
        {/* 喜欢 */}
        <LikesButton 
          postId={id} 
          initialIsLiked={stats.isLiked || false}
          likesCount={stats.likesCount}
          onLikeChange={onLikeChange} 
        />

        {/* 评论 */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            if (!isSignedIn) {
              toast.error('请先登录');
              router.push('/sign-in');
            }
          }}
          className="gap-1.5 h-7 px-2.5 hover:bg-gray-50 text-gray-600"
        >
          <MessageSquare className="w-[14px] h-[14px]" />
          {stats.comments} 条评论
        </Button>

        {/* 分享 */}
        <HomeContentShare postId={id} title={title} />

        {/* 收藏 */}
        <FavouritesButton 
          postId={id} 
          initialIsFavorited={stats.isFavorited || false}
          favoritesCount={stats.favoritesCount}
          onFavoriteChange={onFavoriteChange} 
        />

        <span className="font-medium text-gray-900 ml-auto">作者：{author.name}</span>

        {/* 更多 */}
        <ShowMore postId={id} onDeleteSuccess={onDeleteSuccess} />
      </div>
    </Card>
  );
};