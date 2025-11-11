import { Post } from "@/model/post"


export const PostContent = ({ post }: { post: Post }) => {
    return(
    <div className="mt-6">
        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
    </div>
    )
}