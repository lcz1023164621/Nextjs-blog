'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';
import { Heart } from 'lucide-react';
import { toast } from "sonner";
import { useState, useEffect } from 'react';

interface LikesButtonProps {
  postId: string;
  initialIsLiked: boolean;
  likesCount?: number;
  onLikeChange?: (isLiked: boolean) => void;
}

export const LikesButton = ({ postId, initialIsLiked, likesCount, onLikeChange }: LikesButtonProps) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const utils = trpc.useUtils();

  // 同步外部状态变化
  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);
  
  // 切换点赞 mutation
  const toggleLikeMutation = trpc.like.toggleLike.useMutation({
    // 乐观更新：立即更新 UI
    onMutate: async () => {
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      onLikeChange?.(newIsLiked);
      return { previousIsLiked: isLiked };
    },
    onSuccess: (data) => {
      // 确保状态与服务器一致
      setIsLiked(data.isLiked);
      onLikeChange?.(data.isLiked);
      toast.success(data.message);
      // 刷新相关数据
      utils.post.getPosts.invalidate();
      utils.like.getLikedPosts.invalidate();
    },
    onError: (error, variables, context) => {
      // 发生错误时回滚状态
      if (context?.previousIsLiked !== undefined) {
        setIsLiked(context.previousIsLiked);
        onLikeChange?.(context.previousIsLiked);
      }
      toast.error(error.message || '操作失败');
    },
  });

  const handleLikeClick = () => {
    toggleLikeMutation.mutate({ postId });
  };

  const isLoading = toggleLikeMutation.isPending;

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleLikeClick}
      disabled={isLoading}
      className={`gap-1.5 h-7 px-2.5 hover:bg-gray-50 transition-colors ${
        isLiked ? 'text-red-500' : 'text-gray-600'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Heart className={`w-[14px] h-[14px] transition-all ${
        isLiked ? 'fill-current scale-110' : ''
      }`} />
      {likesCount !== undefined ? `${likesCount === 0 ? '' : likesCount}` : ''}
    </Button>
  );
};
