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
    <div className="relative w-full h-full flex items-center justify-center bg-gray-50 group">
      {showFallback ? (
        <div className="aspect-square max-h-[calc(100vh-73px)] max-w-full rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-9xl font-semibold">
          {post.author.username.charAt(0).toUpperCase()}
        </div>
      ) : (
        <Carousel className="w-full h-full">
          <CarouselContent className="h-full items-center">
            {displayImages.map((image, index) => (
              <CarouselItem key={image.id} className="flex justify-center items-center">
                <div className="relative" style={{ 
                  width: 'min(calc(100vh - 73px), 50vw)',
                  height: 'min(calc(100vh - 73px), 50vw)'
                }}>
                  <Image
                    src={image.imageUrl}
                    alt={`${post.title} - 图片 ${index + 1}`}
                    fill
                    className="object-contain"
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
  )
}