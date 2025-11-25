import { Post } from "@/model/post"
import { AuthInformation } from "@/components/auth-information/auth-information"

export const PostTitle = ({ post }: { post: Post }) => {


    return(
        <div className="p-4">
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
            <div className="flex items-center justify-start gap-2 text-sm text-gray-600">
            <AuthInformation 
              author={{
                id: post.author.id,
                name: post.author.username,
                avatar: post.author.avatar,
                email: post.author.email
              }} 
            />
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
        </div>

      )
}