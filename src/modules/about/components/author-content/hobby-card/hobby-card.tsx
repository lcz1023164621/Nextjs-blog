import { Card, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FaBasketball, FaPersonSwimming, FaDumbbell, FaTv, FaGamepad } from "react-icons/fa6";



export const HobbyCard = () => {


    return(
        <Card className="p-6">
            <CardTitle className="text-sm font-bold tracking-wider mb-2">爱好</CardTitle>
            <Separator className="mb-4" />
            <div className="flex gap-3">
                <ul className="space-y-1">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                        <span>·</span>
                        <FaBasketball className="h-4 w-4 shrink-0" />
                        <span>篮球</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                        <span>·</span>
                        <FaPersonSwimming className="h-4 w-4 shrink-0" />
                        <span>游泳</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                        <span>·</span>
                        <FaDumbbell className="h-4 w-4 shrink-0" />
                        <span>健身</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                        <span>·</span>
                        <FaTv className="h-4 w-4 shrink-0" />
                        <span>看剧</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                        <span>·</span>
                        <FaGamepad className="h-4 w-4 shrink-0" />
                        <span>游戏</span>
                    </li>
                </ul>
            </div>
        </Card>
    )
};

    
