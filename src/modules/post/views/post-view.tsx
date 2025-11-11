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
        <div className="w-full max-w-4xl mx-auto p-4">
            <PostTitle post={post} />
            
            {IsHasPicture && <PostShowImg post={post} />}
            
            <PostContent post={post} />
        </div>

        
    )
}