'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface UsersDetailsProps {
    userId: string;
    bio: string | null;
    isOwner: boolean;
}

export const UsersDetails = ({ userId, bio, isOwner }: UsersDetailsProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [bioText, setBioText] = useState('');
    const utils = trpc.useUtils();
    
    // 更新简介
    const updateBioMutation = trpc.user.updateUserBio.useMutation({
        onSuccess: async (result) => {
            toast.success(result.message);
            setIsEditing(false);
            // 刷新用户信息
            await utils.user.getUserById.invalidate({ userId });
            await utils.user.getUserInfo.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || '更新失败');
        },
    });

    const handleEditClick = () => {
        setBioText(bio || '');
        setIsEditing(true);
    };

    const handleSave = () => {
        updateBioMutation.mutate({ bio: bioText });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setBioText('');
    };

    return (
        <div>
            {!isEditing ? (
                <div className="flex items-start gap-2">
                    <div className="text-sm text-gray-600 flex-1">
                        {bio || '这个人很懒，还没有写个人简介~'}
                    </div>
                    {/* 只有页面所有者才能编辑 */}
                    {isOwner && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEditClick}
                            className="flex-shrink-0 h-6 w-6 p-0"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    <Textarea
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        placeholder="请输入个人简介（最多500字）"
                        maxLength={500}
                        rows={4}
                        className="text-sm resize-none"
                    />
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={updateBioMutation.isPending}
                            className="h-7 text-xs"
                        >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            {updateBioMutation.isPending ? '保存中...' : '保存'}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={updateBioMutation.isPending}
                            className="h-7 text-xs"
                        >
                            <X className="w-3.5 h-3.5 mr-1" />
                            取消
                        </Button>
                        <span className="text-xs text-gray-400 ml-auto">
                            {bioText.length}/500
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};