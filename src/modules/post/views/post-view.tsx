"use client"

import { PostShowImg } from "../components/post-show-img"

export const PostView = ({ postId }: { postId: string }) => {
    return(
        <>
            <PostShowImg postId={postId}/>
        </>
    )
}