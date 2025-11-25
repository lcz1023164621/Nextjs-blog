'use client';

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PersonalDetails } from "./personal-details";
import { trpc } from '@/trpc/client';
import { Users, UserPlus, Heart } from 'lucide-react';

export const PersonalInformation = () => {
    const { user } = useUser();
    
    // 获取用户统计数据
    const { data: userInfoData } = trpc.user.getUserInfo.useQuery();

    
    if (!user) {
        return null;
    }

    // 从 Clerk 获取可用的用户信息
    const username = user.username || user.firstName || '未设置用户名';
    const avatarUrl = user.imageUrl;
    const email = user.emailAddresses[0].emailAddress;
    
    // 从后端获取统计数据
    const stats = userInfoData?.stats || { followingCount: 0, followersCount: 0, totalLikes: 0 };
    
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
                        <span className="font-semibold text-gray-900">{stats.followingCount}</span>
                        <span className="text-gray-500">关注</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">{stats.followersCount}</span>
                        <span className="text-gray-500">粉丝</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">{stats.totalLikes}</span>
                        <span className="text-gray-500">获赞</span>
                    </div>
                </div>

                {/* 简介区域 */}
                <PersonalDetails />

            </div>
        </div>
    );
};
