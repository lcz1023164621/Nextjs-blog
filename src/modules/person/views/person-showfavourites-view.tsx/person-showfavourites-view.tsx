import { PersonNavbar } from "../../components/navbar/person-navbar";
import { PersonalInformation } from "../../components/personal-information/personal-information";
import { PersonShowFavourites } from "../../components/showfavourites/person-showfavourites";

export const PersonShowFavouritesView = () => {
    return(
            <div className="max-w-3xl mx-auto px-4">
                <PersonalInformation />
                <PersonNavbar />
                <div className="py-8">
                    <PersonShowFavourites />
                </div>
            </div>
    )
};
