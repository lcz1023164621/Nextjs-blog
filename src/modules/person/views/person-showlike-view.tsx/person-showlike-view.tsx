import { PersonNavbar } from "../../components/navbar/person-navbar";
import { PersonShowlikes } from "../../components/showlikes/person-showlikes";

export const PersonShowLikesView = () => {

  return (
    <div className="max-w-3xl mx-auto px-4">
        <PersonNavbar />
        <div className="py-8">
          <PersonShowlikes />
        </div>
    </div>
  );
};
