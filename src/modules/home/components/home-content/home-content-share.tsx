'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface HomeContentShareProps {
  postId: string;
  title: string;
}

export const HomeContentShare = ({ postId, title }: HomeContentShareProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // 获取文章的完整 URL
  const getPostUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/post/${postId}`;
    }
    return '';
  };

  // 分享到不同平台
  const shareToWeibo = () => {
    const url = getPostUrl();
    const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
    toast.success('正在跳转到微博...');
  };

  const shareToTwitter = () => {
    const url = getPostUrl();
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
    toast.success('正在跳转到 Twitter...');
  };

  const shareToFacebook = () => {
    const url = getPostUrl();
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
    toast.success('正在跳转到 Facebook...');
  };

  const shareToWeChat = () => {
    const url = getPostUrl();
    // 微信分享需要生成二维码，这里使用第三方二维码生成服务
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    
    // 在新窗口中显示二维码
    const qrWindow = window.open('', '_blank', 'width=400,height=500');
    if (qrWindow) {
      qrWindow.document.write(`
        <html>
          <head>
            <title>微信扫码分享</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: #f5f5f5;
              }
              .container {
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.1);
                text-align: center;
              }
              h2 {
                color: #07c160;
                margin: 0 0 10px 0;
                font-size: 20px;
              }
              p {
                color: #666;
                margin: 0 0 20px 0;
                font-size: 14px;
              }
              img {
                border: 1px solid #eee;
                border-radius: 8px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>微信扫码分享</h2>
              <p>使用微信扫描下方二维码分享文章</p>
              <img src="${qrCodeUrl}" alt="微信二维码" />
            </div>
          </body>
        </html>
      `);
    }
    setIsOpen(false);
    toast.success('已生成微信分享二维码');
  };

  const copyLink = () => {
    const url = getPostUrl();
    navigator.clipboard.writeText(url).then(() => {
      toast.success('链接已复制到剪贴板');
      setIsOpen(false);
    }).catch(() => {
      toast.error('复制失败，请重试');
    });
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="gap-1.5 h-7 px-2.5 hover:bg-gray-50 text-gray-600"
        onClick={() => setIsOpen(true)}
      >
        <Share2 className="w-[14px] h-[14px]" />
        分享
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>分享文章</DialogTitle>
            <DialogDescription>
              选择你想要分享到的平台
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-3 py-4">
            {/* 微博 */}
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-red-50 hover:border-red-300"
              onClick={shareToWeibo}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#E6162D">
                <path d="M9.63 21.42c-3.39.38-6.32-.88-6.54-2.82-.22-1.94 2.35-3.82 5.74-4.2 3.39-.38 6.32.88 6.54 2.82.22 1.94-2.35 3.82-5.74 4.2zm10.17-7.84c-.29-.1-.49-.17-.34-.61.33-.96.36-1.79.01-2.38-.66-1.1-2.47-1.04-4.54-.03 0 0-.65.33-.48-.27.32-1.19.27-2.18-.28-2.76-1.24-1.3-4.54-.03-7.37 2.84-2.11 2.14-3.34 4.41-3.34 6.55 0 3.86 4.95 6.21 9.8 6.21 6.35 0 10.58-3.69 10.58-6.62 0-1.77-1.49-2.78-3.04-2.93zM9.25 19.8c-2.61.24-4.73-.82-4.73-2.36s1.88-2.95 4.49-3.19c2.61-.24 4.73.82 4.73 2.36s-1.88 2.95-4.49 3.19zm.45-3.12c-.45.89-1.43 1.31-2.18.94-.74-.37-.92-1.38-.47-2.27.45-.88 1.4-1.29 2.14-.93.75.37.96 1.38.51 2.26z"/>
              </svg>
              <span className="text-sm font-medium">微博</span>
            </Button>

            {/* Twitter */}
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-300"
              onClick={shareToTwitter}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span className="text-sm font-medium">Twitter</span>
            </Button>

            {/* Facebook */}
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-400"
              onClick={shareToFacebook}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-medium">Facebook</span>
            </Button>

            {/* 微信 */}
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-green-50 hover:border-green-400"
              onClick={shareToWeChat}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#07C160">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1 .178-.557c1.529-1.18 2.506-2.882 2.506-4.755 0-3.744-3.557-6.985-8.066-6.985zm-2.952 3.508c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm5.115 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
              </svg>
              <span className="text-sm font-medium">微信</span>
            </Button>
          </div>

          {/* 复制链接 */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={copyLink}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              复制链接
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};