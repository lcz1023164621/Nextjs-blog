// src/modules/home/components/home-public.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { UserButton } from "@clerk/nextjs"
import { Hash, ImageIcon, Smile, Video } from "lucide-react"

export const HomePublic = () => {
  return (
    <Card className="p-4 border rounded-lg bg-white">
      {/* 顶部输入区域 */}
      <div className="flex gap-3 mb-4">
        {/* Clerk 头像组件 */}
        <div className="flex-shrink-0">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              },
            }}
          />
        </div>

        {/* 输入框 */}
        <div className="flex-1">
          <Textarea
            placeholder="标题"
            className="h-10 max-h-10 border-none focus-visible:ring-0 resize-none text-[15px] px-3 py-2 overflow-hidden"
            rows={1}
          />
          <Textarea
            placeholder="分享此刻的想法..."
            className="min-h-24 max-h-40 border-none focus-visible:ring-0 resize-none text-[15px] px-3 py-2"
            rows={3}
          />

          {/* 工具栏 */}
          <div className="flex items-center gap-4 mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            >
              <Hash className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            >
              <Smile className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            >
              <Video className="w-5 h-5" />
            </Button>

            {/* 发表按钮 */}
            <Button
              variant="default"
              className="ml-auto h-8 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              发表
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
