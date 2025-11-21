"use client"

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/trpc/client";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { useState } from "react";

interface LabelProps {
  name: string;
}

export const Label = ({ name }: LabelProps) => {
  const [open, setOpen] = useState(false);
  
  // 查询相同标签的文章
  const { data, isLoading } = trpc.post.getPostsByTag.useQuery(
    { tagName: name, limit: 20 },
    { enabled: open } // 只在对话框打开时查询
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Badge 
          variant="secondary" 
          className="px-2 py-0.5 text-xs rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border-0 cursor-pointer"
        >
          {name}
        </Badge>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            标签：{name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner className="w-6 h-6" />
            </div>
          ) : data?.posts && data.posts.length > 0 ? (
            <div className="space-y-3">
              {data.posts.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/post/${post.id}`}
                  onClick={() => setOpen(false)}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>作者：{post.author.username}</span>
                    <div className="flex gap-3">
                      <span>{post.likesCount || 0} 点赞</span>
                      <span>{post.commentsCount || 0} 评论</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无相关文章
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
