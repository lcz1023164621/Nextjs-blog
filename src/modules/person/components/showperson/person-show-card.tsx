'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { toast } from 'sonner';

interface PersonShowCardProps {
  id: string;
  title: string;
  coverImage?: string;
  author: {
    username: string;
    avatar: string | null;
  };
  likesCount: number;
  isLiked: boolean;
}

export const PersonShowCard = ({
  id,
  title,
  coverImage,
  author,
  likesCount,
  isLiked,
}: PersonShowCardProps) => {
  const [liked, setLiked] = useState(isLiked);
  const [count, setCount] = useState(likesCount);
  const utils = trpc.useUtils();

  // 切换点赞状态
  const toggleLikeMutation = trpc.like.toggleLike.useMutation({
    onMutate: async () => {
      // 乐观更新
      const newLiked = !liked;
      setLiked(newLiked);
      setCount(prev => newLiked ? prev + 1 : prev - 1);
    },
    onSuccess: async (data) => {
      // 同步服务器状态
      setLiked(data.isLiked);
      toast.success(data.message);
      // 刷新相关数据 - 使用 refetch 立即重新获取
      await Promise.all([
        utils.user.getUserPosts.refetch(),
        utils.like.getLikedPosts.refetch(),
      ]);
    },
    onError: (error) => {
      // 错误回滚
      setLiked(isLiked);
      setCount(likesCount);
      toast.error(error.message || '操作失败');
    },
  });

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止 Link 导航
    e.stopPropagation();
    toggleLikeMutation.mutate({ postId: id });
  };

  // 删除文章
  const deletePostMutation = trpc.post.deletePost.useMutation({
    onSuccess: async (data) => {
      toast.success(data.message);
      // 刷新用户文章列表
      await utils.user.getUserPosts.refetch();
    },
    onError: (error) => {
      toast.error(error.message || '删除失败');
    },
  });

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止 Link 导航
    e.stopPropagation();
    
    if (confirm('确定要删除这篇文章吗？')) {
      deletePostMutation.mutate({ postId: id });
    }
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

            {/* 操作按钮 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* 点赞按钮 */}
              <button
                onClick={handleLikeClick}
                disabled={toggleLikeMutation.isPending}
                className={`flex items-center gap-1 transition-all hover:scale-110 ${
                  liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                } ${toggleLikeMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Heart className={`w-3.5 h-3.5 transition-all ${
                  liked ? 'fill-current' : ''
                }`} />
                <span className="text-xs font-medium">{count}</span>
              </button>

              {/* 删除按钮 */}
              <button
                onClick={handleDeleteClick}
                disabled={deletePostMutation.isPending}
                className={`flex items-center transition-all hover:scale-110 text-gray-400 hover:text-red-500 ${
                  deletePostMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                title="删除文章"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
