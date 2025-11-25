import { UserNavbar } from "../../components/navbar/user-navbar";
import { UsersInformation } from "../../components/users-information/users-information";
import { UserShowFavourites } from "../../components/showfavourites/user-showfavourites";

interface UserShowFavouritesViewProps {
  userId: string;
}

export const UserShowFavouritesView = ({ userId }: UserShowFavouritesViewProps) => {
    return(
            <div className="max-w-3xl mx-auto px-4">
                <UsersInformation userId={userId} />
                <UserNavbar userId={userId} />
                <div className="py-8">
                    <UserShowFavourites userId={userId} />
                </div>
            </div>
    )
};
