"use client"

import { trpc } from "@/trpc/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Loader2, MessageCircle } from "lucide-react";

interface PostCommentShowProps {
    postId: string;
}

export const PostCommentShow = ({ postId }: PostCommentShowProps) => {
    // 获取评论列表
    const { data, isLoading, error } = trpc.comment.getCommentsByPostId.useQuery({
        postId,
        limit: 50,
        offset: 0,
    });

    // 格式化时间
    const formatTime = (date: Date) => {
        return formatDistanceToNow(new Date(date), {
            addSuffix: true,
            locale: zhCN,
        });
    };

    // 加载状态
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    // 错误状态
    if (error) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>加载评论失败</p>
            </div>
        );
    }

    // 空状态
    if (!data?.comments || data.comments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <MessageCircle className="w-12 h-12 mb-2" />
                <p className="text-sm">暂无评论</p>
                <p className="text-xs mt-1">快来抢沙发吧~</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data.comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    {/* 主评论 */}
                    <div className="flex gap-3">
                        {/* 头像 */}
                        <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={comment.author.avatar || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-xs">
                                {comment.author.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {/* 评论内容 */}
                        <div className="flex-1 min-w-0">
                            {/* 用户名和时间 */}
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-gray-900">
                                    {comment.author.username}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {formatTime(comment.createdAt)}
                                </span>
                            </div>

                            {/* 评论文本 */}
                            <p className="text-sm text-gray-700 break-words">
                                {comment.content}
                            </p>

                            {/* 回复列表 */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
                                    {comment.replies.map((reply) => (
                                        <div key={reply.id} className="flex gap-2">
                                            {/* 回复头像 */}
                                            <Avatar className="w-6 h-6 flex-shrink-0">
                                                <AvatarImage src={reply.author.avatar || undefined} />
                                                <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-400 text-white text-[10px]">
                                                    {reply.author.username.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            {/* 回复内容 */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-medium text-xs text-gray-900">
                                                        {reply.author.username}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {formatTime(reply.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-700 break-words">
                                                    {reply.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
