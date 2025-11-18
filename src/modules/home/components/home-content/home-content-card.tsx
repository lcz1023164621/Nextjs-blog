'use client';

import { MessageSquare, Share2, MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { LikesButton } from '@/modules/likes/components/likes-button';
import { FavouritesButton } from '@/modules/favourites/component/favourites-button';

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
  onLikeChange?: (isLiked: boolean) => void;
  onFavoriteChange?: (isFavorited: boolean) => void;
}

export type { TextContentCardProps };

export const HomeContentCard = ({ 
  title, 
  content, 
  thumbnail,
  author,
  stats,
  id,
  onLikeChange,
  onFavoriteChange,
}: TextContentCardProps) => {
  return (

    <Card className="p-4 hover:bg-accent/5 transition-colors border-b rounded-lg">
      {/* 标题 */}
    <Link href={`/post/${id}`}>
      <h3 className="text-[17px] font-medium mb-3 leading-relaxed">
        {title}
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
          <p className="text-[15px] text-gray-700 leading-[1.7] line-clamp-3">
            {content}
            <button className="text-blue-600 hover:text-blue-700 ml-1 inline-flex items-center">
              阅读全文
              <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </button>
          </p>
        </div>
      </div>

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
          className="gap-1.5 h-7 px-2.5 hover:bg-gray-50 text-gray-600"
        >
          <MessageSquare className="w-[14px] h-[14px]" />
          {stats.comments} 条评论
        </Button>

        {/* 分享 */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1.5 h-7 px-2.5 hover:bg-gray-50 text-gray-600"
        >
          <Share2 className="w-[14px] h-[14px]" />
          分享
        </Button>

        {/* 收藏 */}
        <FavouritesButton 
          postId={id} 
          initialIsFavorited={stats.isFavorited || false}
          favoritesCount={stats.favoritesCount}
          onFavoriteChange={onFavoriteChange} 
        />

        <span className="font-medium text-gray-900 ml-auto">作者：{author.name}</span>

        {/* 更多 */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0 hover:bg-gray-50 text-gray-600"
        >
          <MoreHorizontal className="w-[14px] h-[14px]" />
        </Button>
      </div>
    </Card>
  );
};