import { users, activities, systemStats, type User, type InsertUser, type UpdateUser, type Activity, type InsertActivity, type SystemStats } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: UpdateUser): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getUsers(limit?: number, offset?: number): Promise<User[]>;
  searchUsers(searchTerm: string): Promise<User[]>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getRecentActivities(limit?: number): Promise<Activity[]>;
  
  // System stats operations
  getSystemStats(): Promise<SystemStats | undefined>;
  updateSystemStats(): Promise<SystemStats>;
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
    
    // Log activity
    await this.createActivity({
      message: "New user registered",
      details: insertUser.email,
      type: "user_created",
      userId: user.id,
    });
    
    return user;
  }

  async updateUser(id: number, updateUser: UpdateUser): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateUser)
      .where(eq(users.id, id))
      .returning();
    
    if (user) {
      await this.createActivity({
        message: "User updated",
        details: `User ${user.username} was modified`,
        type: "user_updated",
        userId: user.id,
      });
    }
    
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user) return false;
    
    const result = await db.delete(users).where(eq(users.id, id));
    
    if (result.rowCount && result.rowCount > 0) {
      await this.createActivity({
        message: "User deleted",
        details: `User ${user.username} was deleted`,
        type: "user_deleted",
      });
      return true;
    }
    
    return false;
  }

  async getUsers(limit = 50, offset = 0): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        sql`${users.username} ILIKE ${'%' + searchTerm + '%'} OR ${users.email} ILIKE ${'%' + searchTerm + '%'}`
      )
      .orderBy(desc(users.createdAt));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async getRecentActivities(limit = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getSystemStats(): Promise<SystemStats | undefined> {
    const [stats] = await db.select().from(systemStats).orderBy(desc(systemStats.updatedAt)).limit(1);
    return stats || undefined;
  }

  async updateSystemStats(): Promise<SystemStats> {
    // Get current user count
    const [userCountResult] = await db.select({ count: count() }).from(users);
    const totalUsers = userCountResult.count;

    // Generate random stats for demo purposes (in real app, these would come from monitoring)
    const apiRequests = Math.floor(Math.random() * 50000) + 40000;
    const collections = 24; // Fixed for PostgreSQL
    const cpuUsage = Math.floor(Math.random() * 30) + 10;
    const memoryUsage = Math.floor(Math.random() * 40) + 50;
    const storageUsage = Math.floor(Math.random() * 30) + 30;

    const statsData = {
      totalUsers,
      apiRequests,
      collections,
      uptime: "99.9%",
      cpuUsage,
      memoryUsage,
      storageUsage,
    };

    // Insert new stats record
    const [stats] = await db
      .insert(systemStats)
      .values(statsData)
      .returning();

    return stats;
  }
}

export const storage = new DatabaseStorage();
