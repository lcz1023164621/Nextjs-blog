'use client';

import { trpc } from '@/trpc/client';
import { PersonShowLikesCard } from './person-showlikes-card';
import { Loader2 } from 'lucide-react';

export const PersonShowlikes = () => {
  // 从后端获取用户点赞的文章列表
  const { data, isLoading, error } = trpc.like.getLikedPosts.useQuery({
    limit: 20,
    offset: 0,
  });

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>加载失败，请稍后重试</p>
      </div>
    );
  }

  // 空状态
  if (!data?.likedPosts || data.likedPosts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>暂无点赞的文章</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.likedPosts.map((post) => (
        <PersonShowLikesCard
          key={post.id}
          id={post.id}
          title={post.title}
          coverImage={post.images?.[0]?.imageUrl}
          author={{
            username: post.author.username,
            avatar: post.author.avatar,
          }}
          likesCount={post.likesCount || 0}
          isLiked={true}
        />
      ))}
    </div>
  );
};
