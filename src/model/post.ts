export type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
    email: string | null;
  };
  images: {
    id: string;
    imageUrl: string;
  }[];
  tags?: {
    id: string;
    name: string;
  }[];
  likesCount?: number;
  favoritesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  isFavorited?: boolean;
};