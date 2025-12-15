import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { productStocks, products, stores } from "../drizzle/schema";
import { eq, and, sql, lt } from "drizzle-orm";
import { sendLowStockAlert } from "./email";

export const stockRouter = router({
  // Listar estoque de uma loja específica
  listByStore: publicProcedure
    .input(z.object({ storeId: z.number().int() }))
    .query(async ({ input }) => {
      // Busca todos os produtos e faz join com o estoque da loja
      // Se não tiver registro de estoque, retorna null/0
      const result = await db
        .select({
          id: products.id,
          name: products.name,
          brand: products.brand,
          category: products.category,
          unit: products.unit,
          imageUrl: products.imageUrl,
          stockId: productStocks.id,
          quantity: productStocks.quantity,
          minStock: productStocks.minStock,
          maxStock: productStocks.maxStock,
          location: productStocks.location,
        })
        .from(products)
        .leftJoin(
          productStocks,
          and(
            eq(productStocks.productId, products.id),
            eq(productStocks.storeId, input.storeId)
          )
        )
        .where(eq(products.active, 1))
        .orderBy(products.name);

      return result.map(item => ({
        ...item,
        quantity: item.quantity || 0, // Garante 0 se null
        minStock: item.minStock || 0,
      }));
    }),

  // Atualizar configurações de estoque (min/max/localização)
  updateSettings: adminProcedure
    .input(
      z.object({
        productId: z.number().int(),
        storeId: z.number().int(),
        minStock: z.number().int().min(0).optional(),
        maxStock: z.number().int().min(0).optional(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { productId, storeId, minStock, maxStock, location } = input;

      // Verifica se já existe registro
      const existing = await db
        .select()
        .from(productStocks)
        .where(and(eq(productStocks.productId, productId), eq(productStocks.storeId, storeId)))
        .limit(1);

      if (existing.length > 0) {
        // Atualiza
        await db
          .update(productStocks)
          .set({
            ...(minStock !== undefined ? { minStock } : {}),
            ...(maxStock !== undefined ? { maxStock } : {}),
            ...(location !== undefined ? { location } : {}),
            updatedAt: new Date(),
          })
          .where(eq(productStocks.id, existing[0].id));
      } else {
        // Cria novo com quantidade 0
        await db.insert(productStocks).values({
          productId,
          storeId,
          quantity: 0,
          minStock: minStock || 0,
          maxStock: maxStock,
          location,
        });
      }

      return { success: true };
    }),

  // Testar envio de alerta de estoque baixo
  testLowStockAlert: adminProcedure.mutation(async () => {
    // Busca a loja Matriz (id 1)
    const matriz = await db.select().from(stores).where(eq(stores.id, 1)).limit(1);
    
    if (matriz.length === 0) {
      throw new Error("Loja Matriz não encontrada.");
    }

    const store = matriz[0];
    const email = store.notificationEmail || store.email || "teste@exemplo.com";

    await sendLowStockAlert({
      to: email,
      storeName: store.name,
      productName: "PRODUTO DE TESTE",
      currentStock: 5,
      minStock: 10,
      unit: "un",
    });

    return { success: true };
  }),

  // Relatório de Reposição (Produtos abaixo do mínimo)
  getReplenishmentReport: adminProcedure.query(async () => {
    // Busca produtos onde quantity < minStock
    const result = await db
      .select({
        storeName: stores.name,
        productName: products.name,
        brand: products.brand,
        currentStock: productStocks.quantity,
        minStock: productStocks.minStock,
        unit: products.unit,
        toBuy: sql<number>`${productStocks.minStock} - ${productStocks.quantity}`,
      })
      .from(productStocks)
      .innerJoin(products, eq(productStocks.productId, products.id))
      .innerJoin(stores, eq(productStocks.storeId, stores.id))
      .where(
        and(
          eq(products.active, 1),
          eq(stores.active, 1),
          lt(productStocks.quantity, productStocks.minStock), // quantity < minStock
          sql`${productStocks.minStock} > 0` // Apenas se tiver mínimo configurado
        )
      )
      .orderBy(stores.name, products.name);

    return result;
  }),
});
