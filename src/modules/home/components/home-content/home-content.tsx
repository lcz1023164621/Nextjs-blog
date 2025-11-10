"use client"

import { trpc } from "@/trpc/client"
import { HomeContentCard } from "./home-content-card"
import { useEffect, useState } from "react"

export const HomeContent = () => {
    const [mounted, setMounted] = useState(false)
    
    // 获取文章列表
    const { data, isLoading, error } = trpc.post.getPosts.useQuery({
        limit: 10,
        offset: 0,
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    // 防止 SSR Hydration 不匹配
    if (!mounted) {
        return (
            <div className="space-y-4">
                {[1, 2].map((i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="text-red-600">加载文章失败：{error.message}</p>
            </div>
        )
    }

    if (!data?.posts || data.posts.length === 0) {
        return (
            <div className="p-8 text-center border rounded-lg bg-gray-50">
                <p className="text-gray-500">暂无文章，请发表第一篇文章吧！</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {data.posts.map((post) => (
                <HomeContentCard 
                    key={post.id}
                    title={post.title}
                    content={post.content}
                    thumbnail={post.images[0]?.imageUrl || '/panda.jpg'} // 第一张图片或默认图
                    author={{
                        name: post.author.username,
                    }}
                    stats={{
                        agrees: 0,
                        comments: 0,
                        isAgreed: false,
                        isFavorited: false,
                        isLiked: false,
                    }}
                />
            ))}
        </div>
    )
}