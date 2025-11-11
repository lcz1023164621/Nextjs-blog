"use client"

import { PostShowImg } from "../components/post-show-img"
import { Post } from "@/model/post"
import { PostTitle } from "../components/post-title"
import { useEffect, useState } from "react"
import { PostContent } from "../components/post-content"

export const PostView = ({ post }: { post: Post }) => {

    const [IsHasPicture , setIsHasPicture] = useState(false);

    useEffect(() => {
    if(post.images && post.images.length > 0) 
        setIsHasPicture(true);
    } , [post])



    return(
        <div className="flex h-screen">
            {/* 左侧：图片展示区 - 占据左侧空间 */}
            <div className="flex-1">
                {IsHasPicture && <PostShowImg post={post} />}
            </div>
            
            {/* 右侧：信息栏 - 固定宽度 */}
            <div className="w-96 bg-white overflow-y-auto">
                <PostTitle post={post} />
                <PostContent post={post} />
                {/* 未来添加评论区 */}
            </div>
        </div>
        
    )
}