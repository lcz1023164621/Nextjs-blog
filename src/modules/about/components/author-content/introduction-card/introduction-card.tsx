import { Card, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


export const IntroductionCard = () => {

    return(
        <Card className="p-6">
            <CardTitle className="text-sm font-bold tracking-wider mb-2">自我介绍</CardTitle>
            <Separator className="mb-4" />
            <div className="flex gap-3 text-sm text-gray-600">
                无欲无求
            </div>
        </Card>
    )
};
