'use client';

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const PersonalInformation = () => {
    const { user } = useUser();
    
    if (!user) {
        return null;
    }

    // 从 Clerk 获取可用的用户信息
    const username = user.username || user.firstName || '未设置用户名';
    const avatarUrl = user.imageUrl;
    const email = user.emailAddresses[0].emailAddress;
    
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

                {/* 简介占位 */}
                <div className="text-sm text-gray-600 mb-4">
                    还没有简介
                </div>

                {/* 性别占位 */}
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm mb-4">
                    ♂
                </div>

                {/* 统计数据 */}
                <div className="flex items-center gap-6 text-sm">
                    <span className="text-gray-900">
                        <span className="font-semibold">92</span>
                        <span className="text-gray-500 ml-1">关注</span>
                    </span>
                    <span className="text-gray-900">
                        <span className="font-semibold">7</span>
                        <span className="text-gray-500 ml-1">粉丝</span>
                    </span>
                    <span className="text-gray-900">
                        <span className="font-semibold">4</span>
                        <span className="text-gray-500 ml-1">获赞与收藏</span>
                    </span>
                </div>
            </div>
        </div>
    );
};
