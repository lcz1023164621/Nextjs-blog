import { Card, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress"

export const LanguageCard = () => {

    return(
        <Card className="p-6">
            <CardTitle className="text-sm font-bold tracking-wider mb-2">编程语言</CardTitle>
            <Separator className="mb-4" />
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-gray-600 mb-1">C Sharp</p>
                    <Progress value={100} className="h-1" />
                </div>
                <div>
                    <p className="text-sm text-gray-600 mb-1">TypeScript</p>
                    <Progress value={70} className="h-1" />
                </div>
                <div>
                    <p className="text-sm text-gray-600 mb-1">C</p>
                    <Progress value={50} className="h-1" />
                </div>
            </div>
        </Card>
    )
};
