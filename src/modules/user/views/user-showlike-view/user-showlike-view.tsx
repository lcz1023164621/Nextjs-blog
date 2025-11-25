import { UserNavbar } from "../../components/navbar/user-navbar";
import { UsersInformation } from "../../components/users-information/users-information";
import { UserShowLikes } from "../../components/showlikes/user-showlikes";

interface UserShowLikesViewProps {
  userId: string;
}

export const UserShowLikesView = ({ userId }: UserShowLikesViewProps) => {

  return (
    <div className="max-w-3xl mx-auto px-4">
        <UsersInformation userId={userId} />
        <UserNavbar userId={userId} />
        <div className="py-8">
          <UserShowLikes userId={userId} />
        </div>
    </div>
  );
};
