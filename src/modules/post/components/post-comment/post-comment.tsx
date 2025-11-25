"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import { Heart, Star, MessageCircle, Send, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { PostShare } from "@/components/post-share/post-share"
import { useRouter } from "next/navigation"

interface ReplyTo {
    commentId: string;
    username: string;
}

interface PostCommentProps {
    postId: string;
    postTitle: string;
    replyTo: ReplyTo | null;
    onCancelReply: () => void;
    likesCount: number;
    favoritesCount: number;
    commentsCount: number;
    isLiked: boolean;
    isFavorited: boolean;
}

export const PostComment = ({ 
    postId,
    postTitle, 
    replyTo, 
    onCancelReply, 
    likesCount, 
    favoritesCount, 
    commentsCount,
    isLiked,
    isFavorited 
}: PostCommentProps) => {
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentIsLiked, setCurrentIsLiked] = useState(isLiked)
    const [currentIsFavorited, setCurrentIsFavorited] = useState(isFavorited)
    const [currentLikesCount, setCurrentLikesCount] = useState(likesCount)
    const [currentFavoritesCount, setCurrentFavoritesCount] = useState(favoritesCount)
    const inputRef = useRef<HTMLInputElement>(null)

    const utils = trpc.useUtils();
    const { isSignedIn } = useUser();
    const router = useRouter();

    // 同步外部状态变化
    useEffect(() => {
        setCurrentIsLiked(isLiked);
        setCurrentIsFavorited(isFavorited);
        setCurrentLikesCount(likesCount);
        setCurrentFavoritesCount(favoritesCount);
    }, [isLiked, isFavorited, likesCount, favoritesCount]);

    // 切换点赞 mutation
    const toggleLikeMutation = trpc.like.toggleLike.useMutation({
        // 乐观更新：立即更新 UI
        onMutate: async () => {
            const newIsLiked = !currentIsLiked;
            setCurrentIsLiked(newIsLiked);
            setCurrentLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
            return { previousIsLiked: currentIsLiked, previousCount: currentLikesCount };
        },
        onSuccess: (data) => {
            // 确保状态与服务器一致
            setCurrentIsLiked(data.isLiked);
            toast.success(data.message);
            // 刷新文章数据
            utils.post.getPostById.invalidate({ id: postId });
        },
        onError: (error, variables, context) => {
            // 发生错误时回滚状态
            if (context?.previousIsLiked !== undefined) {
                setCurrentIsLiked(context.previousIsLiked);
                setCurrentLikesCount(context.previousCount);
            }
            toast.error(error.message || '操作失败');
        },
    });

    // 切换收藏 mutation
    const toggleFavoriteMutation = trpc.favorites.toggleFavorite.useMutation({
        // 乐观更新：立即更新 UI
        onMutate: async () => {
            const newIsFavorited = !currentIsFavorited;
            setCurrentIsFavorited(newIsFavorited);
            setCurrentFavoritesCount(prev => newIsFavorited ? prev + 1 : prev - 1);
            return { previousIsFavorited: currentIsFavorited, previousCount: currentFavoritesCount };
        },
        onSuccess: (data) => {
            // 确保状态与服务器一致
            setCurrentIsFavorited(data.isFavorited);
            toast.success(data.message);
            // 刷新文章数据
            utils.post.getPostById.invalidate({ id: postId });
        },
        onError: (error, variables, context) => {
            // 发生错误时回滚状态
            if (context?.previousIsFavorited !== undefined) {
                setCurrentIsFavorited(context.previousIsFavorited);
                setCurrentFavoritesCount(context.previousCount);
            }
            toast.error(error.message || '操作失败');
        },
    });

    // 处理点赞
    const handleLikeClick = () => {
        if (!isSignedIn) {
            toast.error('请先登录');
            router.push('/sign-in');
            return;
        }
        toggleLikeMutation.mutate({ postId });
    };

    // 处理收藏
    const handleFavoriteClick = () => {
        if (!isSignedIn) {
            toast.error('请先登录');
            router.push('/sign-in');
            return;
        }
        toggleFavoriteMutation.mutate({ postId });
    };

    // 处理评论按钮点击
    const handleCommentClick = () => {
        inputRef.current?.focus();
    };

    // 创建评论的 mutation
    const createCommentMutation = trpc.comment.createComment.useMutation({
        onSuccess: () => {
            toast.success(replyTo ? "回复发布成功" : "评论发布成功");
            setComment(""); // 清空输入框
            onCancelReply(); // 取消回复状态
            // 刷新评论列表
            utils.comment.getCommentsByPostId.invalidate({ postId });
        },
        onError: (error) => {
            toast.error(error.message || "发布失败");
        },
        onSettled: () => {
            setIsSubmitting(false);
        },
    });

    // 提交评论
    const handleSubmitComment = () => {
        if (!comment.trim()) {
            toast.error("内容不能为空");
            return;
        }

        if (comment.length > 1000) {
            toast.error("内容最多1000个字符");
            return;
        }

        setIsSubmitting(true);
        createCommentMutation.mutate({
            content: comment.trim(),
            postId,
            parentId: replyTo?.commentId, // 如果是回复，则传入父评论ID
        });
    };

    // 处理回车提交
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmitComment();
        }
        // ESC 键取消回复
        if (e.key === "Escape" && replyTo) {
            onCancelReply();
        }
    };

    return(
        <div className="p-2">
            {/* 回复标签 */}
            {replyTo && (
                <div className="flex items-center justify-between bg-blue-50 rounded-lg px-2 py-1 mb-1">
                    <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs text-gray-700">
                            回复 <span className="font-medium text-blue-600">@{replyTo.username}</span>
                        </span>
                    </div>
                    <button
                        onClick={onCancelReply}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* 评论输入框 - 添加圆角背景 */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 mb-2">
                {/* Clerk 头像 */}
                <div className="flex-shrink-0">
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "w-7 h-7",
                            },
                        }}
                    />
                </div>

                {/* 输入框 */}
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={replyTo ? `回复 @${replyTo.username}...` : "说点什么..."}
                    className="flex-1 bg-transparent border-none outline-none text-xs text-gray-600 placeholder:text-gray-400"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isSubmitting}
                />

                {/* 发送按钮 */}
                {comment.trim() && (
                    <button
                        onClick={handleSubmitComment}
                        disabled={isSubmitting}
                        className="flex-shrink-0 text-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* 互动按钮区域 */}
            <div className="flex items-center gap-4 text-gray-500">
                {/* 点赞 */}
                <button 
                    onClick={handleLikeClick}
                    disabled={toggleLikeMutation.isPending}
                    className={`flex items-center gap-1 transition-colors ${
                        currentIsLiked ? 'text-red-500' : 'hover:text-red-500'
                    } ${toggleLikeMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Heart className={`w-4 h-4 ${
                        currentIsLiked ? 'fill-current' : ''
                    }`} />
                    <span className="text-xs">{currentLikesCount}</span>
                </button>

                {/* 收藏 */}
                <button 
                    onClick={handleFavoriteClick}
                    disabled={toggleFavoriteMutation.isPending}
                    className={`flex items-center gap-1 transition-colors ${
                        currentIsFavorited ? 'text-yellow-500' : 'hover:text-yellow-500'
                    } ${toggleFavoriteMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Star className={`w-4 h-4 ${
                        currentIsFavorited ? 'fill-current' : ''
                    }`} />
                    <span className="text-xs">{currentFavoritesCount}</span>
                </button>

                {/* 评论 */}
                <button 
                    onClick={handleCommentClick}
                    className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">{commentsCount}</span>
                </button>

                {/* 分享 */}
                <PostShare postId={postId} title={postTitle} />
            </div>
        </div>
    )
}