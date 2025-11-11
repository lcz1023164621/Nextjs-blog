import { Post } from "@/model/post"


export const PostContent = ({ post }: { post: Post }) => {
    return(
    <div className="px-4 pb-4">
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
    </div>
    )
}