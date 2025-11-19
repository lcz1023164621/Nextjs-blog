import { Separator } from "@/components/ui/separator"
import { AuthorContentView } from "../components/author-content/view/author-content-view"
import { AuthorHeader } from "../components/author-header/author-header"
import { AuthorFooter } from "../components/author-footer/author-footer"

export const AuthorsView = () => {

    return(
        <div>
            <AuthorHeader />
            
            <AuthorContentView />

            <Separator />
            <AuthorFooter />
        </div>
    )
}
