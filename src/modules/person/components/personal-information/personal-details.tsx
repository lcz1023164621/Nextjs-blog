'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export const PersonalDetails = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [bioText, setBioText] = useState('');
    
    // 获取用户信息
    const { data, isLoading, refetch } = trpc.user.getUserInfo.useQuery();
    
    // 更新简介
    const updateBioMutation = trpc.user.updateUserBio.useMutation({
        onSuccess: async (result) => {
            toast.success(result.message);
            setIsEditing(false);
            // 重新获取数据
            await refetch();
        },
        onError: (error) => {
            toast.error(error.message || '更新失败');
        },
    });

    const handleEditClick = () => {
        setBioText(data?.user?.bio || '');
        setIsEditing(true);
    };

    const handleSave = () => {
        updateBioMutation.mutate({ bio: bioText });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setBioText('');
    };

    if (isLoading) {
        return (
            <div className="text-sm text-gray-400">
                加载中...
            </div>
        );
    }

    const bio = data?.user?.bio;

    return (
        <div>
            {!isEditing ? (
                <div className="flex items-start gap-2">
                    <div className="text-sm text-gray-600 flex-1">
                        {bio || '还没有简介'}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditClick}
                        className="flex-shrink-0 h-6 w-6 p-0"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
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