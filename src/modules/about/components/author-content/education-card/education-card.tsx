import { Card, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Circle } from "lucide-react";

export const EducationCard = () => {

    return(
        <Card className="p-6">
            <CardTitle className="text-sm font-bold tracking-wider mb-2">教育经历</CardTitle>
            <Separator className="mb-4" />
            <div className="space-y-6">
                <div className="flex gap-3">
                    <Circle className="h-4 w-4 shrink-0 mt-1" />
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">
                            湖南工业大学 | 2020-2024 | 湖南株洲
                        </h3>
                        <p className="text-sm text-gray-600 font-medium mb-2">
                            电子信息工程 | 学士
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Circle className="h-4 w-4 shrink-0 mt-1" />
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">
                            广东工业大学 | 2024-2027 | 广东广州
                        </h3>
                        <p className="text-sm text-gray-600 font-medium mb-2">
                            人工智能 | 硕士研究生
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    )
};
