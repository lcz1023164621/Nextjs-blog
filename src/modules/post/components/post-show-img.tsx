"use client"

import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"
import { Post } from "@/model/post"


export const PostShowImg = ({ post }: { post: Post }) => {
  // 如果没有图片，使用发布者头像或用户名首字母作为默认图片
  const displayImages = post.images.length > 0 
    ? post.images 
    : post.author.avatar 
      ? [{ id: 'avatar', imageUrl: post.author.avatar }]
      : [];

  // 如果既没有图片也没有头像，显示用户名首字母
  const showFallback = displayImages.length === 0;

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gray-100 group p-4">
      <div className="relative w-full h-full flex items-center justify-center bg-gray-200 rounded-2xl overflow-hidden">
        {showFallback ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-9xl font-semibold">
              {post.author.username.charAt(0).toUpperCase()}
            </div>
          </div>
        ) : (
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
              {displayImages.map((image, index) => (
                <CarouselItem key={image.id} className="h-full flex items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={image.imageUrl}
                      alt={`${post.title} - 图片 ${index + 1}`}
                      width={0}
                      height={0}
                      sizes="100vw"
                      className="w-full h-auto max-h-full object-contain"
                      priority={index === 0}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {displayImages.length > 1 && (
              <>
                <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </Carousel>
        )}
      </div>
    </div>
  )
}