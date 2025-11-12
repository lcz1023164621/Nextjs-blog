"use client"

import { PostShowImg } from "../components/post-show-img"
import { Post } from "@/model/post"
import { PostTitle } from "../components/post-title"
import { useEffect, useState } from "react"
import { PostContent } from "../components/post-content"
import { PostComment } from "../components/post-comment"

export const PostView = ({ post }: { post: Post }) => {

    const [IsHasPicture , setIsHasPicture] = useState(false);

    useEffect(() => {
    if(post.images && post.images.length > 0) 
        setIsHasPicture(true);
    } , [post])



    return(
        <div className="flex h-screen relative">
            {/* 左侧：图片展示区 - 占据左侧空间 */}
            <div className="flex-1">
                {IsHasPicture && <PostShowImg post={post} />}
            </div>
            
            {/* 右侧：信息栏 - 固定宽度 */}
            <div className="w-96 bg-white flex flex-col h-screen overflow-y-auto pb-28">
                {/* 固定在navbar下方的标题 */}
                <div className="fixed top-[73px] right-0 w-96 bg-white border-b border-gray-200 z-40">
                    <PostTitle post={post} />
                </div>
                
                {/* 内容区域 - 添加上边距避免被标题遮挡 */}
                <div className="mt-[170px]">
                    <PostContent post={post} />
                </div>
               
                
                {/* 固定在底部的评论框 */}
                <div className="fixed bottom-0 right-0 w-96 bg-white border-t z-40">
                    <PostComment />
                </div>
            </div>
        </div>
        
    )
}