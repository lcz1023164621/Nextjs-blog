"use client"

import { Button } from "@/components/ui/button"
import { ClapperboardIcon, UserCircleIcon } from "lucide-react"
import { UserButton, SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { trpc } from "@/trpc/client"

export const AuthButton = () => {
    const [mounted, setMounted] = useState(false)
    const [synced, setSynced] = useState(false)
    const { user, isLoaded } = useUser()
    const syncUserMutation = trpc.user.syncUser.useMutation()

    useEffect(() => {
        setMounted(true)
    }, [])

    // 当用户登录状态改变时同步用户数据
    useEffect(() => {
        if (isLoaded && user && !synced) {
            // 确保username不为空
            const username = user.username || user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user_' + user.id.slice(0, 8);
            
            syncUserMutation.mutate({
                clerkId: user.id,
                email: user.emailAddresses[0]?.emailAddress,
                username: username,
                avatar: user.imageUrl,
            }, {
                onSuccess: () => {
                    setSynced(true)
                    console.log('用户数据同步成功')
                },
                onError: (error) => {
                    console.error('用户数据同步失败:', error)
                }
            })
        }
    }, [user, isLoaded, synced])

    if (!mounted) {
        return (
            <div className="w-10 h-10" />
        )
    }

    return(
    <>
    <SignedIn>
        <UserButton>
            <UserButton.MenuItems>
                <UserButton.Link 
                    label="Studio"
                    href="/studio"
                    labelIcon={<ClapperboardIcon className="size-4"/>}
                />
                <UserButton.Action label="manageAccount" />
            </UserButton.MenuItems>
        </UserButton>
    </SignedIn>
    <SignedOut>
        <SignInButton mode="modal">
            <Button variant="outline"
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-500
                border-blue-500/20 rounded-full shadow-none [&_svg]:size-5">
            <UserCircleIcon />
            Sign in
            </Button>
        </SignInButton>
    </SignedOut>

    </>
    )
}