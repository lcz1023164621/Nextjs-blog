import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const ShowMore = () => {

return(
    <>


     <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 hover:bg-gray-50 text-gray-600"
            >
            <MoreHorizontal className="w-[14px] h-[14px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32 p-1" align="start">
        <DropdownMenuLabel className="text-xs py-1 px-2">更多</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="text-xs py-1.5 px-2">
            不感兴趣
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="text-xs py-1.5 px-2">
            举报
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
)
};
