"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
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
    <>

      <Carousel className="w-full">
        <CarouselContent>
          {post.images.map((image, index) => (
            <CarouselItem key={image.id}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-0 relative overflow-hidden">
                    <Image
                      src={image.imageUrl}
                      alt={`${post.title} - 图片 ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {post.images.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>


      </>
  )
}