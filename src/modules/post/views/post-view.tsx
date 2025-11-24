"use client"

import { PostShowImg } from "../components/post-show-img"
import { Post } from "@/model/post"
import { PostTitle } from "../components/post-title"
import { useState } from "react"
import { PostContent } from "../components/post-content"
import { PostComment } from "../components/post-comment"
import { PostCommentShow } from "../components/post-comment-show"

export const PostView = ({ post }: { post: Post }) => {

    const [replyTo, setReplyTo] = useState<{ commentId: string; username: string } | null>(null);

    // 处理回复操作
    const handleReply = (commentId: string, username: string) => {
        setReplyTo({ commentId, username });
        // 可以选择滚动到评论输入框
    };

    // 取消回复
    const handleCancelReply = () => {
        setReplyTo(null);
    };



    return(
        <div className="fixed inset-0 top-[73px] flex">
            {/* 左侧：图片展示区 - 占据屏幕一半 */}
            <div className="w-2/3 overflow-hidden">
                <PostShowImg post={post} />
            </div>
            
            {/* 右侧：信息栏 - 占据屏幕一半 */}
            <div className="w-1/3 bg-white flex flex-col h-full">
                {/* 固定在顶部的标题 */}
                <div className="shrink-0 bg-white border-b border-gray-200 z-40">
                    <PostTitle post={post} />
                </div>
                
                {/* 可滚动的内容区域 */}
                <div className="flex-1 overflow-y-auto pb-20">
                    {/* 文章内容 */}
                    <PostContent post={post} />
                    
                    {/* 评论列表 */}
                    <div className="px-4 py-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">评论</h3>
                        <PostCommentShow postId={post.id} onReply={handleReply} />
                    </div>
                </div>
               
                
                {/* 固定在底部的评论框 */}
                <div className="shrink-0 bg-white border-t z-40">
                    <PostComment
                        postId={post.id} 
                        replyTo={replyTo}
                        onCancelReply={handleCancelReply}
                        likesCount={post.likesCount || 0}
                        favoritesCount={post.favoritesCount || 0}
                        commentsCount={post.commentsCount || 0}
                        isLiked={post.isLiked || false}
                        isFavorited={post.isFavorited || false}
                    />
                </div>
            </div>
        </div>
        
    )
}