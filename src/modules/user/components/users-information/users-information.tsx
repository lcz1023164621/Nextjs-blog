'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UsersDetails } from "./users-details";
import { trpc } from '@/trpc/client';
import { Users, UserPlus } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface UsersInformationProps {
    userId: string;
}

export const UsersInformation = ({ userId }: UsersInformationProps) => {
    const { isSignedIn } = useUser();
    
    // 获取当前登录用户的数据库信息
    const { data: currentUserData } = trpc.user.getUserInfo.useQuery(
        undefined,
        { enabled: isSignedIn }
    );
    
    // 获取指定用户的信息
    const { data: userInfoData } = trpc.user.getUserById.useQuery(
        { userId },
        { enabled: !!userId }
    );

    // 检查当前用户是否为页面所有者（使用数据库 ID 比较）
    const isOwner = currentUserData?.user?.id === userId;

    if (!userInfoData) {
        return null;
    }

    // 从后端获取用户信息
    const username = userInfoData.username || '未设置用户名';
    const avatarUrl = userInfoData.avatar || '';
    const email = userInfoData.email || '';
    
    // 统计数据
    const followingCount = userInfoData.followingCount ?? 0;
    const followersCount = userInfoData.followersCount ?? 0;
    
    return (
        <div className="flex items-start gap-6 p-6">
            {/* 头像 */}
            <Avatar className="w-32 h-32 flex-shrink-0">
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-4xl">
                    {username.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>

            {/* 用户信息 */}
            <div className="flex-1">
                {/* 用户名 */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {username}
                </h1>

                {/* 用户ID和其他信息 */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>邮箱: {email}</span>
                </div>

                {/* 统计数据 */}
                <div className="flex items-center gap-6 text-sm mb-3">
                    <div className="flex items-center gap-1.5">
                        <UserPlus className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">{followingCount}</span>
                        <span className="text-gray-500">关注</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">{followersCount}</span>
                        <span className="text-gray-500">粉丝</span>
                    </div>
                </div>

                {/* 简介区域 */}
                <UsersDetails 
                    userId={userId} 
                    bio={userInfoData.bio}
                    isOwner={isOwner}
                />

            </div>
        </div>
    );
};
