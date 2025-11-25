'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { trpc } from '@/trpc/client';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface AuthInformationProps {
  author: {
    id: string;
    name: string;
    avatar?: string | null;
    email?: string | null;
  };
}

export const AuthInformation = ({ author }: AuthInformationProps) => {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [isFollowing, setIsFollowing] = useState(false);
  
  // 获取当前登录用户的数据库信息
  const { data: currentUserData } = trpc.user.getUserInfo.useQuery(
    undefined,
    { enabled: isSignedIn }
  );
  
  // 检查当前用户是否为作者本人（使用数据库 ID 比较）
  const isCurrentUser = currentUserData?.user?.id === author.id;

  // 获取作者的关注统计（只在悬浮卡片中显示）
  const { data: statsData } = trpc.user.getUserById.useQuery(
    { userId: author.id },
    { enabled: !!author.id }
  );

  // 检查关注状态
  const { data: followStatusData } = trpc.follow.checkFollowStatus.useQuery(
    { targetUserId: author.id },
    { enabled: isSignedIn && !isCurrentUser }
  );

  // 同步关注状态
  useEffect(() => {
    if (followStatusData?.isFollowing !== undefined) {
      setIsFollowing(followStatusData.isFollowing);
    }
  }, [followStatusData]);

  // 当用户登录状态改变时重置关注状态
  useEffect(() => {
    if (!isSignedIn) {
      setIsFollowing(false);
      // 清除所有相关的查询缓存
      utils.user.getUserInfo.reset();
      utils.follow.checkFollowStatus.reset();
    }
  }, [isSignedIn, utils]);

  // 切换关注 mutation
  const toggleFollowMutation = trpc.follow.toggleFollow.useMutation({
    onMutate: async () => {
      const newIsFollowing = !isFollowing;
      setIsFollowing(newIsFollowing);
      return { previousIsFollowing: isFollowing };
    },
    onSuccess: (data) => {
      setIsFollowing(data.isFollowing);
      toast.success(data.message);
      // 刷新相关数据
      utils.follow.checkFollowStatus.invalidate();
      utils.follow.getFollowing.invalidate();
      utils.follow.getFollowers.invalidate();
      utils.user.getUserById.invalidate();
    },
    onError: (error, variables, context) => {
      if (context?.previousIsFollowing !== undefined) {
        setIsFollowing(context.previousIsFollowing);
      }
      toast.error(error.message || '操作失败');
    },
  });

  const handleFollowClick = () => {
    if (!isSignedIn) {
      toast.error('请先登录');
      router.push('/sign-in');
      return;
    }
    toggleFollowMutation.mutate({ targetUserId: author.id });
  };

  const isLoading = toggleFollowMutation.isPending;

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-gray-900 leading-none">作者：</span>
      <HoverCard>
        <HoverCardTrigger asChild>
          <button 
            onClick={() => router.push(`/user/${author.id}`)}
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 rounded-full flex items-center"
          >
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={author.avatar || undefined} alt={author.name} />
              <AvatarFallback className="text-xs">
                {author.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-64" align="end">
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={author.avatar || undefined} alt={author.name} />
                <AvatarFallback>{author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1">
                <h4 className="text-sm font-semibold">{author.name}</h4>
                {author.email && (
                  <p className="text-xs text-muted-foreground break-all">{author.email}</p>
                )}
              </div>
            </div>
            
            {/* 关注和粉丝统计 + 关注按钮 - 放在同一排 */}
            <div className="flex items-center justify-between gap-3">
              {/* 统计数据 */}
              <div className="flex gap-4 text-xs">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">
                    {statsData?.followingCount ?? 0}
                  </span>
                  <span className="text-muted-foreground">关注</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">
                    {statsData?.followersCount ?? 0}
                  </span>
                  <span className="text-muted-foreground">粉丝</span>
                </div>
              </div>

              {/* 关注按钮 - 只在非本人时显示 */}
              {!isCurrentUser && (
                <Button
                  size="sm"
                  onClick={handleFollowClick}
                  disabled={isLoading}
                  className={`h-7 px-3 gap-1.5 transition-colors shrink-0 ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-3.5 h-3.5" />
                      已关注
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      关注
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};