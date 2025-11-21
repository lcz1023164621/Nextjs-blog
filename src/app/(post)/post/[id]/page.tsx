import { PostView } from "@/modules/post/views/post-view"
import { trpc } from "@/trpc/server";

interface PostPageProps {
    params: {
        id: string
    }
}

export default async function PostPage({ params }: PostPageProps) {

    const { id } = await params;

    const post = await trpc.post.getPostById({ id });
    
    if (!post.success || !post.post) {
        return (
            <div className="flex items-center justify-center p-8 text-red-500">
                文章不存在
            </div>
        );
    }
    
    return (
        <PostView post={post.post} />
    )
}