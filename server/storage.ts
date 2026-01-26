import { db } from "./db";
import {
  users, settings, bookings,
  type User, type UpsertUser,
  type Settings, type InsertSettings,
  type Booking, type InsertBooking
} from "@shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Auth (reusing existing interface pattern)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
  
  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
  getBookingsInRange(start: Date, end: Date): Promise<Booking[]>;
}

export class DatabaseStorage implements IStorage {
  // Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: { ...userData, updatedAt: new Date() },
      })
      .returning();
    return user;
  }

  // Settings
  async getSettings(): Promise<Settings> {
    const [existing] = await db.select().from(settings).limit(1);
    if (existing) return existing;
    
    // Create default if none
    const [created] = await db.insert(settings).values({}).returning();
    return created;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    const current = await this.getSettings();
    const [updated] = await db
      .update(settings)
      .set(updates)
      .where(eq(settings.id, current.id))
      .returning();
    return updated;
  }

  // Bookings
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [created] = await db.insert(bookings).values(booking).returning();
    return created;
  }

  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(bookings.scheduledDate);
  }

  async getBookingsInRange(start: Date, end: Date): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(
        and(
          gte(bookings.scheduledDate, start),
          lte(bookings.scheduledDate, end)
        )
      );
  }
}

export const storage = new DatabaseStorage();
// Re-export for auth module compatibility
export const authStorage = storage;
