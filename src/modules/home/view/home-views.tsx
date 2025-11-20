import { HomeContent } from "../components/home-content/home-content"
import { HomeNavbar } from "../components/home-navbar/home-navbar"
import { HomePublic } from "../components/home-public/home-public"


export const Homeview = () => {
    return(
            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="pb-6">
                    <HomeNavbar />
                </div>
                
                <div className="mb-4">
                    <HomePublic />
                </div>
                <HomeContent />
            </div>
    )
}