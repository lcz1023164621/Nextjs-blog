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
  };
  images: {
    id: string;
    imageUrl: string;
  }[];
};