import { pgTable, text, varchar, timestamp, uuid, uniqueIndex, AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/* ===================== 用户表 ===================== */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique().notNull(),
  email: varchar('email', { length: 255 }).unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [uniqueIndex('clerk_id_idx').on(t.clerkId)]);

/* ===================== 文章表 ===================== */
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/* ===================== 文章图片表 ===================== */
export const postImages = pgTable('post_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ===================== 评论表 ===================== */
// 一篇文章可以有多个评论；一个用户可以发多个评论；支持多层嵌套回复（可选 parentId）
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
 parentId: uuid('parent_id')
  .references((): AnyPgColumn => comments.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/* ===================== 关系定义 ===================== */
// 用户 - 文章
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments), // 一个用户有多个评论
}));

// 文章 - 用户 / 图片 / 评论
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  images: many(postImages),
  comments: many(comments), // 一篇文章有多个评论
}));

// 图片 - 文章
export const postImagesRelations = relations(postImages, ({ one }) => ({
  post: one(posts, {
    fields: [postImages.postId],
    references: [posts.id],
  }),
}));

// 评论 - 文章 / 作者 / 子评论（递归关系）
export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'comment_replies', // 消除自引用关系的歧义
  }),
  replies: many(comments, {
    relationName: 'comment_replies', // 与 parent 关系使用相同的名称
  }), // 一条评论可以有多个回复
}));
