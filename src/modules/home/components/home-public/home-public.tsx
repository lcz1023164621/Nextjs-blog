// src/modules/home/components/home-public.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { UserButton, useUser } from "@clerk/nextjs"
import { Hash, ImageIcon, Smile, Video, X } from "lucide-react"
import { useState, useRef } from "react"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Image from "next/image"

export const HomePublic = () => {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const router = useRouter()
  const { isSignedIn } = useUser()
  const utils = trpc.useUtils() // 获取 TRPC utils 用于缓存失效

  // 创建文章的 mutation
  const createPostMutation = trpc.post.createPost.useMutation()

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // 检查用户是否已登录
    if (!isSignedIn) {
      toast.error("请先登录")
      router.push("/sign-in")
      return
    }

    setIsUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '上传失败')
        }

        const data = await response.json()
        return data.url
      })

      const urls = await Promise.all(uploadPromises)
      setUploadedImages(prev => [...prev, ...urls])
      toast.success(`成功上传 ${urls.length} 张图片`)
    } catch (error) {
      console.error('图片上传失败:', error)
      const errorMessage = error instanceof Error ? error.message : '图片上传失败'
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
      // 清空 input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

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
        imageUrls: uploadedImages.length > 0 ? uploadedImages : undefined,
      })

      // 成功后清空输入框
      setTitle("")
      setContent("")
      setUploadedImages([])
      
      // 使缓存失效并强制重新获取（忽略 staleTime）
      await utils.post.getPosts.invalidate(undefined, {
        refetchType: 'active', // 只重新获取活跃的查询
      })
      
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

          {/* 图片预览 */}
          {uploadedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 py-2">
              {uploadedImages.map((url, index) => (
                <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border">
                  <Image
                    src={url}
                    alt={`上传图片 ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    type="button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

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
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              type="button"
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
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
