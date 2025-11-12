"use client"

import { UserButton } from "@clerk/nextjs"
import { Heart, Star, MessageCircle, Share2 } from "lucide-react"
import { useState } from "react"

export const PostComment = () => {
    const [comment, setComment] = useState("")

    return(
        <div className="p-4">
            {/* 评论输入框 - 添加圆角背景 */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2 mb-3">
                {/* Clerk 头像 */}
                <div className="flex-shrink-0">
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "w-9 h-9",
                            },
                        }}
                    />
                </div>

                {/* 输入框 */}
                <input
                    type="text"
                    placeholder="说点什么..."
                    className="flex-1 bg-transparent border-none outline-none text-[14px] text-gray-600 placeholder:text-gray-400"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>

            {/* 互动按钮区域 */}
            <div className="flex items-center gap-6 text-gray-500">
                {/* 点赞 */}
                <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">28</span>
                </button>

                {/* 收藏 */}
                <button className="flex items-center gap-1.5 hover:text-yellow-500 transition-colors">
                    <Star className="w-5 h-5" />
                    <span className="text-sm">10</span>
                </button>

                {/* 评论 */}
                <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">40</span>
                </button>

                {/* 分享 */}
                <button className="flex items-center gap-1.5 hover:text-green-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}