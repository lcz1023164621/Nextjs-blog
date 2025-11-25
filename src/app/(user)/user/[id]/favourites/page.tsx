import { UserShowFavouritesView } from "@/modules/user/views/user-showfavourites-view/user-showfavourites-view";

interface UserFavouritePageProps {
  params: Promise<{ id: string }>;
}

export default async function userFavouritePage({ params }: UserFavouritePageProps){
    const { id } = await params;
    return(
        <div>
            <UserShowFavouritesView userId={id} />
        </div>
    )
}