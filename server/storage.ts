import { users, savedMovies, type User, type InsertUser, type SavedMovie, type InsertSavedMovie } from "@shared/schema";
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
  getSavedMovies(userId: number): Promise<SavedMovie[]>;
  removeSavedMovie(userId: number, movieId: string): Promise<boolean>;
  isMovieSaved(userId: number, movieId: string): Promise<boolean>;
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

  async getSavedMovies(userId: number): Promise<SavedMovie[]> {
    return await db
      .select()
      .from(savedMovies)
      .where(eq(savedMovies.userId, userId))
      .orderBy(desc(savedMovies.createdAt));
  }

  async removeSavedMovie(userId: number, movieId: string): Promise<boolean> {
    const result = await db
      .delete(savedMovies)
      .where(and(eq(savedMovies.userId, userId), eq(savedMovies.movieId, movieId)));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async isMovieSaved(userId: number, movieId: string): Promise<boolean> {
    const [movie] = await db
      .select()
      .from(savedMovies)
      .where(and(eq(savedMovies.userId, userId), eq(savedMovies.movieId, movieId)))
      .limit(1);
    
    return !!movie;
  }
}

export const storage = new DatabaseStorage();
