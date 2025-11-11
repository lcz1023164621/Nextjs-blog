import { PostView } from "@/modules/post/views/post-view"

interface PostPageProps {
    params: {
        id: string
    }
}

export default async function PostPage({ params }: PostPageProps) {

    const { id } =await params;

    //const post = await trpc.post.getPostById.prefetch({ id });
    
    return (
        <div>
            <PostView postId={id} />
        </div>
    )
}