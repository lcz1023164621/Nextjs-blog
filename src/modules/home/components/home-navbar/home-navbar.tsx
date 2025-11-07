'use client'

import Link from "next/link";
import {NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle, } from "@/components/ui/navigation-menu";
import { HomeSearchbar } from "../home-searchbar/home-searchbar";
import { AuthButton } from "@/modules/auth/components/authbutton";

export const HomeNavbar = () => {

    return(
        <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4 py-4">
                    <NavigationMenu className="justify-start flex-shrink-0">
                        <NavigationMenuList className="flex gap-2 md:gap-4">
                        <NavigationMenuItem>
                            <Link href="/" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle() + " text-sm md:text-base"}>
                                    首页
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <Link href="/person" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle() + " text-sm md:text-base"}>
                                    个人
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <Link href="/about" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle() + " text-sm md:text-base"}>
                                    关于
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    {/* 搜索栏 - 居中并限制宽度 */}
                   <div className="flex-1 flex justify-center max-w-[720px] mx-auto">
                        <HomeSearchbar />
                    </div>

                    {/* 右侧占位，保持布局平衡 */}
                    <div className="flex-shrink-0 items-center flex gap-4">
                        <AuthButton />
                    </div>
                </div>
            </div>
        </nav>
    )
}
