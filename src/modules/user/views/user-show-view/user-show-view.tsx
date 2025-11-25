import { UserNavbar } from "../../components/navbar/user-navbar";
import { UsersInformation } from "../../components/users-information/users-information";
import { UserShow } from "../../components/showperson/user-show";

interface UserShowViewProps {
  userId: string;
}

export const UserShowView = ({ userId }: UserShowViewProps) => {


  return (
    <div className="max-w-3xl mx-auto px-4">
        <UsersInformation userId={userId} />
        <UserNavbar userId={userId} />
        <div className="py-8">
            
            <UserShow userId={userId} />
        </div>
    </div>
  );
};
