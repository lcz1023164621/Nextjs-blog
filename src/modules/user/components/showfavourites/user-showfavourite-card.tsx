'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import Link from 'next/link';

interface UserShowFavouriteCardProps {
  id: string;
  title: string;
  coverImage?: string;
  author: {
    username: string;
    avatar: string | null;
  };
  isFavorited: boolean;
}

export const UserShowFavouriteCard = ({
  id,
  title,
  coverImage,
  author,
}: UserShowFavouriteCardProps) => {

  return (
    <Link href={`/post/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        {/* 封面图片 */}
        <div className="relative w-full aspect-[3/2] bg-gradient-to-br from-gray-800 to-gray-900">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="w-full h-full object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : author.avatar ? (
            <Image
              src={author.avatar}
              alt={author.username}
              fill
              className="w-full h-full object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-sm">暂无封面</span>
            </div>
          )}
        </div>

        {/* 内容区域 */}
        <div className="p-3">
          {/* 标题 */}
          <h3 className="text-sm font-medium mb-3 line-clamp-2 leading-relaxed text-gray-900 min-h-[2.5rem]">
            {title}
          </h3>

          {/* 底部信息 */}
          <div className="flex items-center justify-between">
            {/* 作者信息 */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="w-5 h-5 flex-shrink-0">
                <AvatarImage src={author.avatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-[10px]">
                  {author.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600 truncate">{author.username}</span>
            </div>


          </div>
        </div>
      </Card>
    </Link>
  );
};