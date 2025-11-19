'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { toast } from 'sonner';

interface PersonShowFavouriteCardProps {
  id: string;
  title: string;
  coverImage?: string;
  author: {
    username: string;
    avatar: string | null;
  };
  favoritesCount: number;
  isFavorited: boolean;
}

export const PersonShowFavouriteCard = ({
  id,
  title,
  coverImage,
  author,
  favoritesCount,
  isFavorited,
}: PersonShowFavouriteCardProps) => {
  const [favorited, setFavorited] = useState(isFavorited);
  const [count, setCount] = useState(favoritesCount);
  const utils = trpc.useUtils();

  // 切换收藏状态
  const toggleFavoriteMutation = trpc.favorites.toggleFavorite.useMutation({
    onMutate: async () => {
      // 乐观更新
      const newFavorited = !favorited;
      setFavorited(newFavorited);
      setCount(prev => newFavorited ? prev + 1 : prev - 1);
    },
    onSuccess: async (data) => {
      // 同步服务器状态
      setFavorited(data.isFavorited);
      toast.success(data.message);
      // 刷新相关数据 - 使用 refetch 立即重新获取
      await Promise.all([
        utils.favorites.getFavoritedPosts.refetch(),
        utils.user.getUserPosts.refetch(),
      ]);
    },
    onError: (error) => {
      // 错误回滚
      setFavorited(isFavorited);
      setCount(favoritesCount);
      toast.error(error.message || '操作失败');
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止 Link 导航
    e.stopPropagation();
    toggleFavoriteMutation.mutate({ postId: id });
  };

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

            {/* 收藏按钮 */}
            <button
              onClick={handleFavoriteClick}
              disabled={toggleFavoriteMutation.isPending}
              className={`flex items-center gap-1 flex-shrink-0 transition-all hover:scale-110 ${
                favorited ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-400'
              } ${toggleFavoriteMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Star className={`w-3.5 h-3.5 transition-all ${
                favorited ? 'fill-current' : ''
              }`} />
              <span className="text-xs font-medium">{count}</span>
            </button>
          </div>
        </div>
      </Card>
    </Link>
  );
};