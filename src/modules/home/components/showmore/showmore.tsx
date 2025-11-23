'use client';

import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, EyeOff, Flag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { trpc } from '@/trpc/client';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ShowMoreProps {
  postId: string;
  onDeleteSuccess?: () => void;
}

export const ShowMore = ({ postId, onDeleteSuccess }: ShowMoreProps) => {
  const { isSignedIn } = useUser();
  const [isOwner, setIsOwner] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // 检查文章所有权
  const { data: ownershipData } = trpc.post.checkPostOwnership.useQuery(
    { postId },
    { enabled: isSignedIn }
  );

  useEffect(() => {
    if (ownershipData?.isOwner) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [ownershipData]);

  // 监听登录状态变化，退出登录时重置 isOwner
  useEffect(() => {
    if (!isSignedIn) {
      setIsOwner(false);
    }
  }, [isSignedIn]);

  // 删除文章
  const deletePostMutation = trpc.post.deletePost.useMutation({
    onSuccess: () => {
      toast.success('文章删除成功');
      // 调用回调函数触发父组件重新渲染
      onDeleteSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || '删除失败');
    },
  });

  const handleDelete = () => {
    deletePostMutation.mutate({ postId });
    setShowDeleteDialog(false);
  };

return(
    <>


     <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 hover:bg-gray-50 text-gray-600"
            >
            <MoreHorizontal className="w-[14px] h-[14px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32 p-1" align="start">
        <DropdownMenuLabel className="text-xs py-1 px-2">更多</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="text-xs py-1.5 px-2 flex items-center">
            <EyeOff className="w-3 h-3 mr-1.5" />
            不感兴趣
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="text-xs py-1.5 px-2 flex items-center">
            <Flag className="w-3 h-3 mr-1.5" />
            举报
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {isOwner && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className="text-xs py-1.5 px-2 text-red-600 focus:text-red-600 flex items-center"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-3 h-3 mr-1.5" />
                删除文章
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>

    {/* 删除确认对话框 */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除文章？</AlertDialogTitle>
          <AlertDialogDescription>
            此操作不可恢复，将永久删除该文章。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={deletePostMutation.isPending}
          >
            {deletePostMutation.isPending ? '删除中...' : '确认删除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
)
};
