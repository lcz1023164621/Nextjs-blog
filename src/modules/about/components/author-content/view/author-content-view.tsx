import { EducationCard } from "../education-card/education-card"
import { HobbyCard } from "../hobby-card/hobby-card"
import { IntroductionCard } from "../introduction-card/introduction-card"
import { LanguageCard } from "../language-card/language-card"

export const AuthorContentView = () => {
    
    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 gap-6">
                {/* 左侧栏 */}
                <div className="space-y-6">
                    <LanguageCard />
                    <IntroductionCard />
                </div>
                {/* 右侧栏 */}
                <div className="space-y-6">
                    <EducationCard />
                    <HobbyCard />
                </div>
            </div>
        </div>
    )
}
