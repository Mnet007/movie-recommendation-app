import { users, savedMovies, userWatchlists, watchlistMovies, type User, type InsertUser, type SavedMovie, type InsertSavedMovie, type UserWatchlist, type InsertWatchlist, type WatchlistMovie, type InsertWatchlistMovie } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Movie operations
  saveMovie(movie: InsertSavedMovie): Promise<SavedMovie>;
  getSavedMovies(userId: number, listType?: string): Promise<SavedMovie[]>;
  removeSavedMovie(userId: number, movieId: string, listType?: string): Promise<boolean>;
  isMovieSaved(userId: number, movieId: string, listType?: string): Promise<boolean>;
  
  // Watchlist operations
  createWatchlist(watchlist: InsertWatchlist): Promise<UserWatchlist>;
  getUserWatchlists(userId: number): Promise<UserWatchlist[]>;
  getWatchlist(id: number): Promise<UserWatchlist | undefined>;
  deleteWatchlist(id: number, userId: number): Promise<boolean>;
  addMovieToWatchlist(movie: InsertWatchlistMovie): Promise<WatchlistMovie>;
  removeMovieFromWatchlist(watchlistId: number, movieId: string): Promise<boolean>;
  getWatchlistMovies(watchlistId: number): Promise<WatchlistMovie[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async saveMovie(movie: InsertSavedMovie): Promise<SavedMovie> {
    const [savedMovie] = await db
      .insert(savedMovies)
      .values(movie)
      .returning();
    return savedMovie;
  }

  async getSavedMovies(userId: number, listType = "favorites"): Promise<SavedMovie[]> {
    return await db
      .select()
      .from(savedMovies)
      .where(and(eq(savedMovies.userId, userId), eq(savedMovies.listType, listType)))
      .orderBy(desc(savedMovies.createdAt));
  }

  async removeSavedMovie(userId: number, movieId: string, listType = "favorites"): Promise<boolean> {
    const result = await db
      .delete(savedMovies)
      .where(and(
        eq(savedMovies.userId, userId), 
        eq(savedMovies.movieId, movieId),
        eq(savedMovies.listType, listType)
      ));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async isMovieSaved(userId: number, movieId: string, listType = "favorites"): Promise<boolean> {
    const [movie] = await db
      .select()
      .from(savedMovies)
      .where(and(
        eq(savedMovies.userId, userId), 
        eq(savedMovies.movieId, movieId),
        eq(savedMovies.listType, listType)
      ))
      .limit(1);
    
    return !!movie;
  }

  async createWatchlist(watchlist: InsertWatchlist): Promise<UserWatchlist> {
    const [newWatchlist] = await db
      .insert(userWatchlists)
      .values(watchlist)
      .returning();
    return newWatchlist;
  }

  async getUserWatchlists(userId: number): Promise<UserWatchlist[]> {
    return await db
      .select()
      .from(userWatchlists)
      .where(eq(userWatchlists.userId, userId))
      .orderBy(desc(userWatchlists.createdAt));
  }

  async getWatchlist(id: number): Promise<UserWatchlist | undefined> {
    const [watchlist] = await db
      .select()
      .from(userWatchlists)
      .where(eq(userWatchlists.id, id));
    return watchlist || undefined;
  }

  async deleteWatchlist(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(userWatchlists)
      .where(and(eq(userWatchlists.id, id), eq(userWatchlists.userId, userId)));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async addMovieToWatchlist(movie: InsertWatchlistMovie): Promise<WatchlistMovie> {
    const [watchlistMovie] = await db
      .insert(watchlistMovies)
      .values(movie)
      .returning();
    return watchlistMovie;
  }

  async removeMovieFromWatchlist(watchlistId: number, movieId: string): Promise<boolean> {
    const result = await db
      .delete(watchlistMovies)
      .where(and(eq(watchlistMovies.watchlistId, watchlistId), eq(watchlistMovies.movieId, movieId)));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getWatchlistMovies(watchlistId: number): Promise<WatchlistMovie[]> {
    return await db
      .select()
      .from(watchlistMovies)
      .where(eq(watchlistMovies.watchlistId, watchlistId))
      .orderBy(desc(watchlistMovies.addedAt));
  }
}

export const storage = new DatabaseStorage();
