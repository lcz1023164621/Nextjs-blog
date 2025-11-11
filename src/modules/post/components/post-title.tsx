import { Post } from "@/model/post"

export const PostTitle = ({ post }: { post: Post }) => {


    return(
        <div className="p-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>作者:{post.author.username}</span>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
        </div>

      )
}