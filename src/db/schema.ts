import { pgTable, text, varchar, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 用户表
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId:text("clerk_id").unique().notNull(),
  email: varchar('email', { length: 255 }).unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
},(t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)]);

// 文章表
export const posts = pgTable("posts", {
  // 文章唯一 ID（主键）
  id: uuid("id").primaryKey().defaultRandom(),
  // 标题
  title: text("title").notNull(),
  // 正文内容
  content: text("content").notNull(),
  // 作者外键，关联到 users.id
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // 当用户被删除时，删除其文章
  // 创建时间
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // 更新时间
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/*一个用户对应多篇文章 */
export const usersRelations = relations(users, ({ many }) => ({
   posts: many(posts),
}));

/**文章的外键关系 */
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  images: many(postImages), // 一篇文章可以有多张图片
}));

//文章图片表，可以对应多个图片
export const postImages = pgTable("post_images", {
  id: uuid("id").primaryKey().defaultRandom(), // 图片唯一 ID
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }), // 所属文章外键
  imageUrl: text("image_url").notNull(), // 图片 URL
  createdAt: timestamp("created_at").defaultNow().notNull(), // 上传时间
});

/**一张图片只能对应一篇文章 */
export const postImagesRelations = relations(postImages, ({ one }) => ({
  post: one(posts, {
    fields: [postImages.postId],
    references: [posts.id],
  }),
}));
