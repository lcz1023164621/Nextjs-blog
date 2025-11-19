"use client"

import { PostShowImg } from "../components/post-show-img"
import { Post } from "@/model/post"
import { PostTitle } from "../components/post-title"
import { useEffect, useState } from "react"
import { PostContent } from "../components/post-content"
import { PostComment } from "../components/post-comment"
import { PostCommentShow } from "../components/post-comment-show"

export const PostView = ({ post }: { post: Post }) => {

    const [IsHasPicture , setIsHasPicture] = useState(false);
    const [replyTo, setReplyTo] = useState<{ commentId: string; username: string } | null>(null);

    useEffect(() => {
    if(post.images && post.images.length > 0) 
        setIsHasPicture(true);
    } , [post])

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
        <div className="flex h-screen relative">
            {/* 左侧：图片展示区 - 占据左侧空间，固定不可滚动 */}
            <div className="flex-1 overflow-hidden">
                {IsHasPicture && <PostShowImg post={post} />}
            </div>
            
            {/* 右侧：信息栏 - 固定宽度 */}
            <div className="w-96 bg-white flex flex-col h-screen">
                {/* 固定在navbar下方的标题 */}
                <div className="fixed top-[73px] right-0 w-96 bg-white border-b border-gray-200 z-40">
                    <PostTitle post={post} />
                </div>
                
                {/* 可滚动的内容区域 */}
                <div className="flex-1 overflow-y-auto mt-[120px] pb-20">
                    {/* 文章内容 */}
                    <PostContent post={post} />
                    
                    {/* 评论列表 */}
                    <div className="px-4 py-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">评论</h3>
                        <PostCommentShow postId={post.id} onReply={handleReply} />
                    </div>
                </div>
               
                
                {/* 固定在底部的评论框 */}
                <div className="fixed bottom-0 right-0 w-96 bg-white border-t z-40">
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