import { PersonNavbar } from "../../components/navbar/person-navbar";
import { PersonShowFavourites } from "../../components/showfavourites/person-showfavourites";

export const PersonShowFavouritesView = () => {
    return(
            <div className="max-w-3xl mx-auto px-4">
                <PersonNavbar />
                <div className="py-8">
                    <PersonShowFavourites />
                </div>
            </div>
    )
};
