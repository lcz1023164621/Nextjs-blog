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

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gray-100 group p-4">
      <div className="relative w-full h-full flex items-center justify-center bg-gray-200 rounded-2xl overflow-hidden">
        <Carousel className="w-full h-full">
          <CarouselContent className="h-full">
            {post.images.map((image, index) => (
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
          {post.images.length > 1 && (
            <>
              <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </Carousel>
      </div>
    </div>
  )
}