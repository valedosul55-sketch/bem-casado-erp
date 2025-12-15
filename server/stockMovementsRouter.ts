import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { stockMovements, products, productStocks, stores } from "../drizzle/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { processStockEntry } from "./averageCost";

// Schema de validação para criar movimentação
const createMovementSchema = z.object({
  productId: z.number(),
  storeId: z.number().optional(),
  movementType: z.enum(["entry", "exit", "adjustment"]),
  quantity: z.number(),
  reason: z.string(),
  unitCost: z.number().optional(),
  notes: z.string().optional(),
  userId: z.number().optional(),
});

// Schema para filtros
const filterSchema = z.object({
  productId: z.number().optional(),
  storeId: z.number().optional(),
  movementType: z.enum(["entry", "exit", "adjustment"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const stockMovementsRouter = router({
  // Buscar produto por código de barras
  getByBarcode: publicProcedure
    .input(z.object({ barcode: z.string() }))
    .query(async ({ input }) => {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.ean13, input.barcode))
        .limit(1);

      return product || null;
    }),
  // Listar movimentações com filtros
  list: publicProcedure
    .input(filterSchema.optional())
    .query(async ({ input }) => {
      const conditions = [];
      
      if (input?.productId) {
        conditions.push(eq(stockMovements.productId, input.productId));
      }
      
      if (input?.storeId) {
        conditions.push(eq(stockMovements.storeId, input.storeId));
      }
      
      if (input?.movementType) {
        conditions.push(eq(stockMovements.movementType, input.movementType));
      }
      
      if (input?.startDate) {
        conditions.push(gte(stockMovements.createdAt, new Date(input.startDate)));
      }
      
      if (input?.endDate) {
        conditions.push(lte(stockMovements.createdAt, new Date(input.endDate)));
      }

      const movements = await db
        .select({
          id: stockMovements.id,
          productId: stockMovements.productId,
          productName: products.name,
          storeId: stockMovements.storeId,
          storeName: stores.name,
          movementType: stockMovements.movementType,
          quantity: stockMovements.quantity,
          unitCost: stockMovements.unitCost,
          reason: stockMovements.reason,
          notes: stockMovements.notes,
          createdAt: stockMovements.createdAt,
        })
        .from(stockMovements)
        .leftJoin(products, eq(stockMovements.productId, products.id))
        .leftJoin(stores, eq(stockMovements.storeId, stores.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(stockMovements.createdAt))
        .limit(100);

      return movements;
    }),

  // Criar movimentação (entrada, saída ou ajuste)
  create: publicProcedure
    .input(createMovementSchema)
    .mutation(async ({ input }) => {
      try {
        // Validar se o produto existe
        const [product] = await db
          .select()
          .from(products)
          .where(eq(products.id, input.productId))
          .limit(1);

        if (!product) {
          throw new Error("Produto não encontrado");
        }

        // Calcular a quantidade real baseada no tipo de movimentação
        let quantityChange = input.quantity;
        if (input.movementType === "exit") {
          quantityChange = -Math.abs(input.quantity); // Saída sempre negativa
        } else if (input.movementType === "entry") {
          quantityChange = Math.abs(input.quantity); // Entrada sempre positiva
        }
        // adjustment pode ser positivo ou negativo conforme input.quantity

        // Inserir movimentação
        const [movement] = await db
          .insert(stockMovements)
          .values({
            productId: input.productId,
            storeId: input.storeId,
            movementType: input.movementType,
            quantity: quantityChange,
            unitCost: input.unitCost,
            reason: input.reason,
            notes: input.notes,
            userId: input.userId,
          })
          .returning();

        // Atualizar estoque do produto
        if (input.storeId) {
          // Atualizar estoque por loja
          const [existingStock] = await db
            .select()
            .from(productStocks)
            .where(
              and(
                eq(productStocks.productId, input.productId),
                eq(productStocks.storeId, input.storeId)
              )
            )
            .limit(1);

          if (existingStock) {
            // Atualizar estoque existente
            await db
              .update(productStocks)
              .set({
                quantity: sql`${productStocks.quantity} + ${quantityChange}`,
                updatedAt: new Date(),
              })
              .where(eq(productStocks.id, existingStock.id));
          } else {
            // Criar novo registro de estoque
            await db.insert(productStocks).values({
              productId: input.productId,
              storeId: input.storeId,
              quantity: Math.max(0, quantityChange), // Não permitir estoque negativo
            });
          }
        }

        // Atualizar estoque geral do produto (tabela products)
        await db
          .update(products)
          .set({
            stock: sql`${products.stock} + ${quantityChange}`,
            updatedAt: new Date(),
          })
          .where(eq(products.id, input.productId));

        // Calcular e atualizar custo médio se for entrada com custo informado
        let newAverageCost: number | undefined;
        if (input.movementType === "entry" && input.unitCost && input.unitCost > 0) {
          newAverageCost = await processStockEntry(
            input.productId,
            Math.abs(quantityChange),
            input.unitCost
          );
        }

        return {
          success: true,
          movement,
          newAverageCost,
          message: `Movimentação de ${input.movementType === "entry" ? "entrada" : input.movementType === "exit" ? "saída" : "ajuste"} registrada com sucesso${newAverageCost ? ` | Novo custo médio: R$ ${(newAverageCost / 100).toFixed(2)}` : ''}`,
        };
      } catch (error) {
        console.error("[StockMovements] Error creating movement:", error);
        throw new Error(
          error instanceof Error ? error.message : "Erro ao criar movimentação"
        );
      }
    }),

  // Obter resumo de movimentações por produto
  summary: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const movements = await db
        .select({
          movementType: stockMovements.movementType,
          totalQuantity: sql<number>`SUM(${stockMovements.quantity})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(stockMovements)
        .where(eq(stockMovements.productId, input.productId))
        .groupBy(stockMovements.movementType);

      return movements;
    }),

  // Obter movimentações recentes
  recent: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const movements = await db
        .select({
          id: stockMovements.id,
          productId: stockMovements.productId,
          productName: products.name,
          storeId: stockMovements.storeId,
          storeName: stores.name,
          movementType: stockMovements.movementType,
          quantity: stockMovements.quantity,
          reason: stockMovements.reason,
          createdAt: stockMovements.createdAt,
        })
        .from(stockMovements)
        .leftJoin(products, eq(stockMovements.productId, products.id))
        .leftJoin(stores, eq(stockMovements.storeId, stores.id))
        .orderBy(desc(stockMovements.createdAt))
        .limit(input.limit);

      return movements;
    }),
});
