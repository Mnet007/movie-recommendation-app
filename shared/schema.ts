import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedMovies = pgTable("saved_movies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  movieId: text("movie_id").notNull(), // TMDB movie ID
  title: text("title").notNull(),
  posterPath: text("poster_path"),
  releaseDate: text("release_date"),
  overview: text("overview"),
  rating: integer("rating"), // User's personal rating 1-10
  listType: text("list_type").notNull().default("favorites"), // 'favorites' or 'watchlist'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userWatchlists = pgTable("user_watchlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const watchlistMovies = pgTable("watchlist_movies", {
  id: serial("id").primaryKey(),
  watchlistId: integer("watchlist_id").notNull(),
  movieId: text("movie_id").notNull(),
  title: text("title").notNull(),
  posterPath: text("poster_path"),
  releaseDate: text("release_date"),
  overview: text("overview"),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

// Movie schemas
export const saveMovieSchema = z.object({
  movieId: z.string().min(1, "Movie ID is required"),
  title: z.string().min(1, "Title is required"),
  posterPath: z.string().optional(),
  releaseDate: z.string().optional(),
  overview: z.string().optional(),
  rating: z.number().min(1).max(10).optional(),
  listType: z.enum(["favorites", "watchlist"]).default("favorites"),
});

export const createWatchlistSchema = z.object({
  name: z.string().min(1, "Watchlist name is required"),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const addToWatchlistSchema = z.object({
  watchlistId: z.number().min(1, "Watchlist ID is required"),
  movieId: z.string().min(1, "Movie ID is required"),
  title: z.string().min(1, "Title is required"),
  posterPath: z.string().optional(),
  releaseDate: z.string().optional(),
  overview: z.string().optional(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSavedMovieSchema = createInsertSchema(savedMovies).omit({
  id: true,
  createdAt: true,
});

export const insertWatchlistSchema = createInsertSchema(userWatchlists).omit({
  id: true,
  createdAt: true,
});

export const insertWatchlistMovieSchema = createInsertSchema(watchlistMovies).omit({
  id: true,
  addedAt: true,
});

export type User = typeof users.$inferSelect;
export type SavedMovie = typeof savedMovies.$inferSelect;
export type UserWatchlist = typeof userWatchlists.$inferSelect;
export type WatchlistMovie = typeof watchlistMovies.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSavedMovie = z.infer<typeof insertSavedMovieSchema>;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type InsertWatchlistMovie = z.infer<typeof insertWatchlistMovieSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type SaveMovieData = z.infer<typeof saveMovieSchema>;
export type CreateWatchlistData = z.infer<typeof createWatchlistSchema>;
export type AddToWatchlistData = z.infer<typeof addToWatchlistSchema>;
