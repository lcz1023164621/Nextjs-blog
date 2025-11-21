'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';
import { Languages, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { useState } from 'react';

interface TranslateButtonProps {
  text: string;
  targetLang?: 'en' | 'zh';
  onTranslated?: (translatedText: string) => void;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const TranslateButton = ({ 
  text, 
  targetLang = 'zh', 
  onTranslated,
  variant = 'ghost',
  size = 'sm',
  className = ''
}: TranslateButtonProps) => {
  const [isTranslating, setIsTranslating] = useState(false);
  
  // AI翻译 mutation
  const translateMutation = trpc.ai.translate.useMutation({
    onMutate: () => {
      setIsTranslating(true);
    },
    onSuccess: (data) => {
      setIsTranslating(false);
      toast.success('翻译成功');
      onTranslated?.(data.translatedText);
    },
    onError: (error) => {
      setIsTranslating(false);
      toast.error(error.message || '翻译失败');
    },
  });

  const handleTranslateClick = () => {
    if (!text.trim()) {
      toast.error('翻译内容不能为空');
      return;
    }
    translateMutation.mutate({ text, targetLang });
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleTranslateClick}
      disabled={isTranslating}
      className={`gap-1.5 ${className} ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isTranslating ? (
        <Loader2 className="w-[14px] h-[14px] animate-spin" />
      ) : (
        <Languages className="w-[14px] h-[14px]" />
      )}
      <span className="text-sm">{isTranslating ? '翻译中...' : '翻译'}</span>
    </Button>
  );
};