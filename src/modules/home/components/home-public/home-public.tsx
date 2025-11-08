// src/modules/home/components/home-public.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { UserButton, useUser } from "@clerk/nextjs"
import { Hash, ImageIcon, Smile, Video } from "lucide-react"
import { useState } from "react"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export const HomePublic = () => {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const router = useRouter()
  const { isSignedIn } = useUser()

  // 创建文章的 mutation
  const createPostMutation = trpc.post.createPost.useMutation()

  // 处理发表按钮点击
  const handlePublish = async () => {
    // 验证输入
    if (!title.trim()) {
      toast.error("请输入标题")
      return
    }
    if (!content.trim()) {
      toast.error("请输入内容")
      return
    }

    // 检查用户是否已登录
    if (!isSignedIn) {
      toast.error("请先登录")
      // 清空文本框
      setTitle("")
      setContent("")
      // 跳转到登录页面
      router.push("/sign-in")
      return
    }

    setIsSubmitting(true)

    try {
      await createPostMutation.mutateAsync({
        title: title.trim(),
        content: content.trim(),
      })

      // 成功后清空输入框
      setTitle("")
      setContent("")
      toast.success("发表成功！")
    } catch (error) {
      console.error("发表失败:", error)
      const errorMessage = error instanceof Error ? error.message : "发表失败,请稍后重试"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="分享此刻的想法..."
            className="min-h-24 max-h-40 border-none focus-visible:ring-0 resize-none text-[15px] px-3 py-2"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
              className="ml-auto h-8 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePublish}
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? "发表中..." : "发表"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
