"use client"

import { trpc } from "@/trpc/client"
import { HomeContentCard } from "./home-content-card"
import { useEffect, useState, useRef, useCallback } from "react"
import { Spinner } from "@/components/ui/spinner"
import { useUser } from "@clerk/nextjs"

const PAGE_SIZE = 10 // 每页加载数量

// 定义文章类型
type Post = {
    id: string
    title: string
    content: string
    isLiked: boolean
    isFavorited: boolean
    commentsCount: number
    likesCount?: number
    favoritesCount?: number
    author: {
        id: string
        username: string
        avatar: string | null
        email: string | null
    }
    images: {
        id: string
        imageUrl: string
    }[]
    tags?: {
        id: string
        name: string
    }[]
}

export const HomeContent = () => {
    const [mounted, setMounted] = useState(false)
    const [allPosts, setAllPosts] = useState<Post[]>([])
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const observerTarget = useRef<HTMLDivElement>(null)
    const { isSignedIn } = useUser()
    const utils = trpc.useUtils()
    
    // 获取文章列表
    const { data, isLoading, error } = trpc.post.getPosts.useQuery(
        {
            limit: PAGE_SIZE,
            offset: offset,
        },
        {
            enabled: mounted,
        }
    )

    // 处理新数据
    useEffect(() => {
        if (data?.posts) {
            if (offset === 0) {
                // offset=0 时总是重置数据（首次加载或刷新）
                setAllPosts(data.posts)
                setHasMore(data.posts.length >= PAGE_SIZE)
                setIsRefreshing(false)
            } else {
                // 分页加载，累加数据并去重
                setAllPosts(prev => {
                    const newPosts = data.posts
                        .filter(newPost => !prev.some(existingPost => existingPost.id === newPost.id))
                    return [...prev, ...newPosts]
                })
                setHasMore(data.posts.length >= PAGE_SIZE)
            }
        }
    }, [data, offset])

    // 处理点赞状态变化
    const handleLikeChange = useCallback((postId: string, isLiked: boolean) => {
        setAllPosts(prev => 
            prev.map(post => 
                post.id === postId 
                    ? { ...post, isLiked } 
                    : post
            )
        )
    }, [])

    // 处理收藏状态变化
    const handleFavoriteChange = useCallback((postId: string, isFavorited: boolean) => {
        setAllPosts(prev => 
            prev.map(post => 
                post.id === postId 
                    ? { ...post, isFavorited } 
                    : post
            )
        )
    }, [])

    // 处理文章删除
    const handleDeleteSuccess = useCallback((postId: string) => {
        // 从列表中移除已删除的文章
        setAllPosts(prev => prev.filter(post => post.id !== postId))
    }, [])

    // Intersection Observer 回调
    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const [target] = entries
        if (target.isIntersecting && !isLoading && hasMore) {
            setOffset(prev => prev + PAGE_SIZE)
        }
    }, [isLoading, hasMore])

    // 监听登录状态变化，重新获取数据
    useEffect(() => {
        if (!mounted) return
        
        // 登录状态改变时重置数据并重新加载
        setIsRefreshing(true)
        setOffset(0)
        setAllPosts([])
        utils.post.getPosts.invalidate()
    }, [isSignedIn, mounted, utils.post.getPosts])

    // 设置 Intersection Observer
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return

        const element = observerTarget.current
        if (!element) return

        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '100px', // 提前 100px 触发加载
            threshold: 0.1,
        })

        observer.observe(element)

        return () => observer.disconnect()
    }, [mounted, handleObserver])

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

    // 初次加载或刷新时显示骨架屏
    if ((isLoading && allPosts.length === 0) || isRefreshing) {
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

    if (error && allPosts.length === 0) {
        return (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="text-red-600">加载文章失败：{error.message}</p>
            </div>
        )
    }

    if (allPosts.length === 0 && !isLoading) {
        return (
            <div className="p-8 text-center border rounded-lg bg-gray-50">
                <p className="text-gray-500">暂无文章，请发表第一篇文章吧！</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {allPosts.map((post) => (
                <HomeContentCard 
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    content={post.content}
                    thumbnail={post.images[0]?.imageUrl || post.author.avatar || undefined}
                    author={{
                        id: post.author.id,
                        name: post.author.username,
                        avatar: post.author.avatar,
                        email: post.author.email,
                    }}
                    stats={{
                        comments: post.commentsCount,
                        isFavorited: post.isFavorited,
                        isLiked: post.isLiked,
                        likesCount: post.likesCount,
                        favoritesCount: post.favoritesCount,
                    }}
                    tags={post.tags}
                    onLikeChange={(isLiked) => handleLikeChange(post.id, isLiked)}
                    onFavoriteChange={(isFavorited) => handleFavoriteChange(post.id, isFavorited)}
                    onDeleteSuccess={() => handleDeleteSuccess(post.id)}
                />
            ))}

            {/* 观察目标元素 */}
            <div ref={observerTarget} className="py-8 flex justify-center">
                {isLoading && hasMore && (
                    <div className="flex items-center gap-2 text-gray-500">
                        <Spinner className="w-5 h-5" />
                        <span>加载中...</span>
                    </div>
                )}
                {!hasMore && allPosts.length > 0 && (
                    <p className="text-gray-400 text-sm">没有更多内容了</p>
                )}
            </div>
        </div>
    )
}