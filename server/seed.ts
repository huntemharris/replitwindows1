import { storage } from "./storage";

export async function seedDatabase() {
  const settings = await storage.getSettings();
  console.log("Database seeded with settings:", settings);
}
