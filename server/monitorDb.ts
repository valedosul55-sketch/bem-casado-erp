import { eq, desc, and, gte } from "drizzle-orm";
import { db } from "./db";
import {
  monitorCategories,
  monitorSources,
  monitorUpdates,
  monitorScrapingLogs,
  monitorNotificationSettings,
  type InsertMonitorCategory,
  type InsertMonitorSource,
  type InsertMonitorUpdate,
  type InsertMonitorScrapingLog,
  type InsertMonitorNotificationSetting,
} from "../drizzle/schema";

/**
 * Helpers para gerenciar categorias de monitoramento
 */
export async function getAllCategories() {
  return db.select().from(monitorCategories);
}

export async function createCategory(data: InsertMonitorCategory) {
  const [category] = await db.insert(monitorCategories).values(data).returning();
  return category;
}

/**
 * Helpers para gerenciar fontes de monitoramento
 */
export async function getAllSources() {
  return db.select().from(monitorSources);
}

export async function getActiveSources() {
  return db.select().from(monitorSources).where(eq(monitorSources.isActive, 1));
}

export async function getSourcesByCategory(categoryId: number) {
  return db
    .select()
    .from(monitorSources)
    .where(and(eq(monitorSources.categoryId, categoryId), eq(monitorSources.isActive, 1)));
}

export async function createSource(data: InsertMonitorSource) {
  const [source] = await db.insert(monitorSources).values(data).returning();
  return source;
}

export async function updateSourceLastScraped(sourceId: number) {
  await db
    .update(monitorSources)
    .set({ lastScrapedAt: new Date() })
    .where(eq(monitorSources.id, sourceId));
}

/**
 * Helpers para gerenciar atualizações coletadas
 */
export async function getAllUpdates(limit = 100) {
  return db.select().from(monitorUpdates).orderBy(desc(monitorUpdates.createdAt)).limit(limit);
}

export async function getUpdatesByCategory(categoryId: number, limit = 100) {
  return db
    .select()
    .from(monitorUpdates)
    .where(eq(monitorUpdates.categoryId, categoryId))
    .orderBy(desc(monitorUpdates.createdAt))
    .limit(limit);
}

export async function getUnreadUpdates() {
  return db
    .select()
    .from(monitorUpdates)
    .where(eq(monitorUpdates.isRead, 0))
    .orderBy(desc(monitorUpdates.createdAt));
}

export async function getRecentUpdates(days = 7) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);

  return db
    .select()
    .from(monitorUpdates)
    .where(gte(monitorUpdates.createdAt, dateThreshold))
    .orderBy(desc(monitorUpdates.createdAt));
}

export async function createUpdate(data: InsertMonitorUpdate) {
  const [update] = await db.insert(monitorUpdates).values(data).returning();
  return update;
}

export async function markUpdateAsRead(updateId: number) {
  await db.update(monitorUpdates).set({ isRead: 1 }).where(eq(monitorUpdates.id, updateId));
}

export async function checkUpdateExists(title: string, sourceId: number) {
  const existing = await db
    .select()
    .from(monitorUpdates)
    .where(and(eq(monitorUpdates.title, title), eq(monitorUpdates.sourceId, sourceId)))
    .limit(1);

  return existing.length > 0;
}

/**
 * Helpers para logs de scraping
 */
export async function createScrapingLog(data: InsertMonitorScrapingLog) {
  const [log] = await db.insert(monitorScrapingLogs).values(data).returning();
  return log;
}

export async function getRecentLogs(limit = 50) {
  return db
    .select()
    .from(monitorScrapingLogs)
    .orderBy(desc(monitorScrapingLogs.createdAt))
    .limit(limit);
}

/**
 * Helpers para configurações de notificação
 */
export async function getNotificationSettings(userId: number) {
  return db
    .select()
    .from(monitorNotificationSettings)
    .where(eq(monitorNotificationSettings.userId, userId));
}

export async function createNotificationSetting(data: InsertMonitorNotificationSetting) {
  const [setting] = await db.insert(monitorNotificationSettings).values(data).returning();
  return setting;
}

export async function updateNotificationSetting(
  id: number,
  data: Partial<InsertMonitorNotificationSetting>
) {
  await db.update(monitorNotificationSettings).set(data).where(eq(monitorNotificationSettings.id, id));
}
