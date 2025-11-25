import { UserShowLikesView } from "@/modules/user/views/user-showlike-view/user-showlike-view";

interface UserLikePageProps {
  params: Promise<{ id: string }>;
}

export default async function UserLikePage({ params }: UserLikePageProps){
    const { id } = await params;
    return(
        <div>
            <UserShowLikesView userId={id} />
        </div>
    )
}