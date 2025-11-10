import { ThumbsUp, MessageSquare, Share2, Bookmark, Heart, MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface TextContentCardProps {
  title: string;
  content: string;
  thumbnail?: string;
  author: {
    name: string;
  };
  stats: {
    agrees: number;
    comments: number;
    isAgreed?: boolean;
    isFavorited?: boolean;
    isLiked?: boolean;
  };
}

export const HomeContentCard = ({ 
  title, 
  content, 
  thumbnail,
  author,
  stats 
}: TextContentCardProps) => {
  return (

    <Card className="p-4 hover:bg-accent/5 transition-colors border-b rounded-none rounded-lg">
      {/* 标题 */}
    <Link href={`/post/${title}`}>
      <h3 className="text-[17px] font-medium mb-3 leading-relaxed">
        {title}
      </h3>
    </Link>
    
      <div className="flex gap-3">
        {/* 左侧缩略图(可选) */}
        {thumbnail && (
          <div className="w-[120px] h-20 rounded flex-shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center">
            {thumbnail.endsWith('.svg') ? (
              <img 
                src={thumbnail} 
                alt={title}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <Image 
                src={thumbnail} 
                alt={title}
                width={100}
                height={100}
                className="object-cover"
                sizes="50px"
              />
            )}
          </div>
        )}


        {/* 内容区域 */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] text-gray-700 leading-[1.7] line-clamp-3">
            {content}
            <button className="text-blue-600 hover:text-blue-700 ml-1 inline-flex items-center">
              阅读全文
              <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </button>
          </p>
        </div>
      </div>

      {/* 底部互动栏 */}
      <div className="flex items-center gap-5 mt-4 text-[13px] text-gray-500">
        {/* 赞同 */}
        <Button 
          variant="ghost" 
          size="sm"
          className={`gap-1.5 h-7 px-2.5 -ml-2.5 hover:bg-blue-50 ${
            stats.isAgreed ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
          }`}
        >
          <ThumbsUp className={`w-[14px] h-[14px] ${stats.isAgreed ? 'fill-current' : ''}`} />
          赞同 {stats.agrees}
        </Button>

        {/* 踩 */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1.5 h-7 px-2.5 hover:bg-gray-50 text-gray-600"
        >
          <ThumbsUp className="w-[14px] h-[14px] rotate-180" />
        </Button>

        {/* 评论 */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1.5 h-7 px-2.5 hover:bg-gray-50 text-gray-600"
        >
          <MessageSquare className="w-[14px] h-[14px]" />
          {stats.comments} 条评论
        </Button>

        {/* 分享 */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1.5 h-7 px-2.5 hover:bg-gray-50 text-gray-600"
        >
          <Share2 className="w-[14px] h-[14px]" />
          分享
        </Button>

        {/* 收藏 */}
        <Button 
          variant="ghost" 
          size="sm" 
          className={`gap-1.5 h-7 px-2.5 hover:bg-gray-50 ${
            stats.isFavorited ? 'text-yellow-600' : 'text-gray-600'
          }`}
        >
          <Bookmark className={`w-[14px] h-[14px] ${stats.isFavorited ? 'fill-current' : ''}`} />
          收藏
        </Button>

        {/* 喜欢 */}
        <Button 
          variant="ghost" 
          size="sm" 
          className={`gap-1.5 h-7 px-2.5 hover:bg-gray-50 ${
            stats.isLiked ? 'text-red-500' : 'text-gray-600'
          }`}
        >
          <Heart className={`w-[14px] h-[14px] ${stats.isLiked ? 'fill-current' : ''}`} />
          喜欢
        </Button>

        <span className="font-medium text-gray-900">作者：{author.name}</span>{' '}

        {/* 更多 */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0 ml-auto hover:bg-gray-50 text-gray-600"
        >
          <MoreHorizontal className="w-[14px] h-[14px]" />
        </Button>
      </div>
    </Card>
  );
};