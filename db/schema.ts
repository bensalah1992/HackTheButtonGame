import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  nickname: text("nickname").notNull(),
  score: integer("score").notNull(),
  isHardMode: boolean("is_hard_mode").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

// Leaderboard schemas
export const insertLeaderboardSchema = createInsertSchema(leaderboard);
export const selectLeaderboardSchema = createSelectSchema(leaderboard);
export type InsertLeaderboardEntry = typeof leaderboard.$inferInsert;
export type SelectLeaderboardEntry = typeof leaderboard.$inferSelect;