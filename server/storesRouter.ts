/**
 * Router de Lojas (Stores)
 * 
 * Gerencia informações e configurações das lojas
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { stores } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const storesRouter = router({
  /**
   * Listar todas as lojas
   */
  getAll: protectedProcedure.query(async () => {
    return await db
      .select()
      .from(stores)
      .where(eq(stores.active, 1));
  }),

  /**
   * Buscar loja por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [store] = await db
        .select()
        .from(stores)
        .where(eq(stores.id, input.id))
        .limit(1);

      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Store ${input.id} not found`,
        });
      }

      return store;
    }),

  /**
   * Atualizar configurações da loja
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        cnpj: z.string().optional(),
        ie: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        notificationEmail: z.string().optional(),
        stockValuationMethod: z.enum(["fifo", "average_cost"]).optional(),
        active: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;

      // Verificar se loja existe
      const [store] = await db
        .select()
        .from(stores)
        .where(eq(stores.id, id))
        .limit(1);

      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Store ${id} not found`,
        });
      }

      // Atualizar loja
      const [updatedStore] = await db
        .update(stores)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(stores.id, id))
        .returning();

      return {
        success: true,
        store: updatedStore,
      };
    }),
});
