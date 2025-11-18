'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';
import { Bookmark } from 'lucide-react';
import { toast } from "sonner";
import { useState, useEffect } from 'react';

interface FavouritesButtonProps {
  postId: string;
  initialIsFavorited: boolean;
  favoritesCount?: number;
  onFavoriteChange?: (isFavorited: boolean) => void;
}

export const FavouritesButton = ({ postId, initialIsFavorited, favoritesCount, onFavoriteChange }: FavouritesButtonProps) => {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const utils = trpc.useUtils();

  // 同步外部状态变化
  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);
  
  // 切换收藏 mutation
  const toggleFavoriteMutation = trpc.favorites.toggleFavorite.useMutation({
    // 乐观更新：立即更新 UI
    onMutate: async () => {
      const newIsFavorited = !isFavorited;
      setIsFavorited(newIsFavorited);
      onFavoriteChange?.(newIsFavorited);
      return { previousIsFavorited: isFavorited };
    },
    onSuccess: (data) => {
      // 确保状态与服务器一致
      setIsFavorited(data.isFavorited);
      onFavoriteChange?.(data.isFavorited);
      toast.success(data.message);
      // 刷新相关数据
      utils.post.getPosts.invalidate();
      utils.favorites.getFavoritedPosts.invalidate();
    },
    onError: (error, variables, context) => {
      // 发生错误时回滚状态
      if (context?.previousIsFavorited !== undefined) {
        setIsFavorited(context.previousIsFavorited);
        onFavoriteChange?.(context.previousIsFavorited);
      }
      toast.error(error.message || '操作失败');
    },
  });

  const handleFavoriteClick = () => {
    toggleFavoriteMutation.mutate({ postId });
  };

  const isLoading = toggleFavoriteMutation.isPending;

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleFavoriteClick}
      disabled={isLoading}
      className={`gap-1.5 h-7 px-2.5 hover:bg-gray-50 transition-colors ${
        isFavorited ? 'text-yellow-600' : 'text-gray-600'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Bookmark className={`w-[14px] h-[14px] transition-all ${
        isFavorited ? 'fill-current' : ''
      }`} />
      {favoritesCount !== undefined ? `${favoritesCount === 0 ? '' : favoritesCount}` : ''} 收藏
    </Button>
  );
};