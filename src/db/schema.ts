import { pgTable, text, varchar, timestamp, uuid, uniqueIndex, AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/* ===================== 用户表 ===================== */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique().notNull(),
  email: varchar('email', { length: 255 }).unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  avatar: text('avatar'),
  bio: text('bio'),
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

/* ===================== 点赞表 ===================== */
// 用户对文章的点赞关系
export const postLikes = pgTable('post_likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ===================== 收藏表 ===================== */
// 用户对文章的收藏关系
export const postFavorites = pgTable('post_favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ===================== 标签表 ===================== */
// 文章标签
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ===================== 文章-标签关联表 ===================== */
// 文章与标签的多对多关系
export const postTags = pgTable('post_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ===================== 关注表 ===================== */
// 用户之间的关注关系
export const follows = pgTable('follows', {
  id: uuid('id').primaryKey().defaultRandom(),
  followerId: uuid('follower_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  followingId: uuid('following_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ===================== 聊天会话表 ===================== */
// 两个用户之间的聊天会话
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/* ===================== 会话参与者表 ===================== */
// 会话中的参与者（支持未来扩展群聊）
export const conversationParticipants = pgTable('conversation_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

/* ===================== 消息表 ===================== */
// 会话中的消息
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/* ===================== 关系定义 ===================== */
// 用户 - 文章
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments), // 一个用户有多个评论
  postLikes: many(postLikes), // 一个用户可以点赞多篇文章
  postFavorites: many(postFavorites), // 一个用户可以收藏多篇文章
  followers: many(follows, { relationName: 'following' }), // 关注该用户的人
  following: many(follows, { relationName: 'follower' }), // 该用户关注的人
  conversationParticipants: many(conversationParticipants), // 用户参与的会话
  messages: many(messages), // 用户发送的消息
}));

// 标签 - 文章
export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags), // 一个标签可以关联多篇文章
}));

// 文章-标签关联
export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

// 文章 - 用户 / 图片 / 评论
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  images: many(postImages),
  comments: many(comments), // 一篇文章有多个评论
  likes: many(postLikes), // 一篇文章可以被多个用户点赞
  favorites: many(postFavorites), // 一篇文章可以被多个用户收藏
  postTags: many(postTags), // 一篇文章可以有多个标签
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

// 点赞 - 文章 / 用户 点赞记录属于一篇文章和一个用户
export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
}));

// 收藏 - 文章 / 用户 收藏记录属于一篇文章和一个用户
export const postFavoritesRelations = relations(postFavorites, ({ one }) => ({
  post: one(posts, {
    fields: [postFavorites.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postFavorites.userId],
    references: [users.id],
  }),
}));

// 关注 - 用户 关注关系属于两个用户
export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: 'follower',
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: 'following',
  }),
}));

// 会话 - 参与者 / 消息
export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants), // 一个会话有多个参与者
  messages: many(messages), // 一个会话有多条消息
}));

// 会话参与者 - 会话 / 用户
export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));

// 消息 - 会话 / 发送者
export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
