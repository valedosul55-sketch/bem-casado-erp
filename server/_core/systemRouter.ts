import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { db } from "../db";
import { stores, alertLogs } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  getStores: publicProcedure
    .query(async () => {
      return await db.select().from(stores).where(eq(stores.active, 1));
    }),

  createStore: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        cnpj: z.string().min(14),
        ie: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        active: z.number().int().default(1),
      })
    )
    .mutation(async ({ input }) => {
      const [newStore] = await db.insert(stores).values(input).returning();
      return newStore;
    }),

  updateStore: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().min(1),
        cnpj: z.string().min(14),
        ie: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        active: z.number().int(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const [updatedStore] = await db
        .update(stores)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(stores.id, id))
        .returning();
      return updatedStore;
    }),

  deleteStore: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      // Soft delete (set active = 0) instead of hard delete to preserve history
      await db
        .update(stores)
        .set({ active: 0, updatedAt: new Date() })
        .where(eq(stores.id, input.id));
      return { success: true };
    }),

  getAlertLogs: adminProcedure
    .query(async () => {
      return await db
        .select()
        .from(alertLogs)
        .orderBy(desc(alertLogs.createdAt))
        .limit(100);
    }),
});
