import { Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { User, MapPin, Phone, Mail } from "lucide-react";

export const AuthorHeader = () => {

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-3">
      <Card className="relative w-full h-40 bg-pink-400">
          <div className="absolute inset-y-0 left-0 flex items-center p-2">
            <Avatar className="h-full w-36">
              <AvatarImage src="/chiikawa1.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute inset-y-0 left-44 right-0 flex flex-col gap-2 p-4">
            <div className="flex items-center">
              <User className="h-5 w-5 shrink-0" /> <span className="pl-2">廖晨郅</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 shrink-0" /> <span className="pl-2">广东广州</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 shrink-0" /> <span className="pl-2">137-5026-9088</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 shrink-0" /> <span className="pl-2">lcz1023164621@gmail.com</span>
            </div>
          </div>
        
      </Card>
    </div>
  );
};
