import { PersonNavbar } from "../../components/navbar/person-navbar";
import { PersonShow } from "../../components/showperson/person-show";

export const PersonShowView = () => {


  return (
    <div className="max-w-3xl mx-auto px-4">
        <PersonNavbar />
        <div className="py-8">
            <PersonShow />
        </div>
    </div>
  );
};
