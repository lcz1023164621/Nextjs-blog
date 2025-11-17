export interface TextContentCardProps {
  id: string;
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