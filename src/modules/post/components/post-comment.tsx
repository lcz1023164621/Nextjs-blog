"use client"

import { UserButton } from "@clerk/nextjs"
import { Heart, Star, MessageCircle, Share2, Send } from "lucide-react"
import { useState } from "react"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"

interface PostCommentProps {
    postId: string;
}

export const PostComment = ({ postId }: PostCommentProps) => {
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const utils = trpc.useUtils();

    // 创建评论的 mutation
    const createCommentMutation = trpc.comment.createComment.useMutation({
        onSuccess: () => {
            toast.success("评论发布成功");
            setComment(""); // 清空输入框
            // 刷新评论列表
            utils.comment.getCommentsByPostId.invalidate({ postId });
        },
        onError: (error) => {
            toast.error(error.message || "评论发布失败");
        },
        onSettled: () => {
            setIsSubmitting(false);
        },
    });

    // 提交评论
    const handleSubmitComment = () => {
        if (!comment.trim()) {
            toast.error("评论内容不能为空");
            return;
        }

        if (comment.length > 1000) {
            toast.error("评论最多1000个字符");
            return;
        }

        setIsSubmitting(true);
        createCommentMutation.mutate({
            content: comment.trim(),
            postId,
        });
    };

    // 处理回车提交
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmitComment();
        }
    };

    return(
        <div className="p-4">
            {/* 评论输入框 - 添加圆角背景 */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2 mb-3">
                {/* Clerk 头像 */}
                <div className="flex-shrink-0">
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "w-9 h-9",
                            },
                        }}
                    />
                </div>

                {/* 输入框 */}
                <input
                    type="text"
                    placeholder="说点什么..."
                    className="flex-1 bg-transparent border-none outline-none text-[14px] text-gray-600 placeholder:text-gray-400"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSubmitting}
                />

                {/* 发送按钮 */}
                {comment.trim() && (
                    <button
                        onClick={handleSubmitComment}
                        disabled={isSubmitting}
                        className="flex-shrink-0 text-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* 互动按钮区域 */}
            <div className="flex items-center gap-6 text-gray-500">
                {/* 点赞 */}
                <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">28</span>
                </button>

                {/* 收藏 */}
                <button className="flex items-center gap-1.5 hover:text-yellow-500 transition-colors">
                    <Star className="w-5 h-5" />
                    <span className="text-sm">10</span>
                </button>

                {/* 评论 */}
                <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">40</span>
                </button>

                {/* 分享 */}
                <button className="flex items-center gap-1.5 hover:text-green-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}