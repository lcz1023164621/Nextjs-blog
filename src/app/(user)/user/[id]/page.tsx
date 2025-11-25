import { UserShowView } from "@/modules/user/views/user-show-view/user-show-view";

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: UserPageProps){
    const { id } = await params;
    return(
        <div>
            <UserShowView userId={id} />
        </div>
    )
}