import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
});

// Movie schemas
export const saveMovieSchema = z.object({
  movieId: z.string().min(1, "Movie ID is required"),
  title: z.string().min(1, "Title is required"),
  posterPath: z.string().optional(),
  releaseDate: z.string().optional(),
  overview: z.string().optional(),
  rating: z.number().min(1).max(10).optional(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSavedMovieSchema = createInsertSchema(savedMovies).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type SavedMovie = typeof savedMovies.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSavedMovie = z.infer<typeof insertSavedMovieSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type SaveMovieData = z.infer<typeof saveMovieSchema>;
