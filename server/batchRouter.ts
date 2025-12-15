/**
 * Router de Controle de Lotes e Validade
 * 
 * Gerencia lotes de produtos com controle de validade e FIFO:
 * - Criação e atualização de lotes
 * - Controle de data de fabricação e validade
 * - FIFO (First In, First Out) automático
 * - Alertas de produtos próximos ao vencimento
 * - Rastreabilidade completa (NF-e → Lote → Venda)
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { 
  stockBatches, 
  products, 
  productStocks, 
  stockMovements, 
  stores,
  orders
} from "../drizzle/schema";
import { eq, and, sql, lte, gte, desc, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Router de lotes
 */
export const batchRouter = router({
  /**
   * Criar novo lote
   * 
   * Cria um lote de produto com controle de validade
   * 
   * @param productId - ID do produto
   * @param storeId - ID da loja
   * @param batchNumber - Número do lote
   * @param quantity - Quantidade do lote
   * @param unitCost - Custo unitário em centavos
   * @param entryDate - Data de entrada (ISO string)
   * @param expiryDate - Data de validade (ISO string, opcional)
   * @param supplier - Fornecedor (opcional)
   * @param notes - Observações (opcional)
   */
  create: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        storeId: z.number(),
        batchNumber: z.string().min(1).max(50),
        quantity: z.number().min(1),
        unitCost: z.number().min(0),
        entryDate: z.string(), // ISO string
        expiryDate: z.string().optional(), // ISO string
        supplier: z.string().max(255).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        productId,
        storeId,
        batchNumber,
        quantity,
        unitCost,
        entryDate,
        expiryDate,
        supplier,
        notes,
      } = input;

      // Verificar se produto existe
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Product ${productId} not found`,
        });
      }

      // Verificar se loja existe
      const [store] = await db
        .select()
        .from(stores)
        .where(eq(stores.id, storeId))
        .limit(1);

      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Store ${storeId} not found`,
        });
      }

      // Verificar se lote já existe
      const [existingBatch] = await db
        .select()
        .from(stockBatches)
        .where(
          and(
            eq(stockBatches.batchNumber, batchNumber),
            eq(stockBatches.productId, productId),
            eq(stockBatches.storeId, storeId)
          )
        )
        .limit(1);

      if (existingBatch) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Batch ${batchNumber} already exists for this product and store`,
        });
      }

      // Criar lote
      const [batch] = await db
        .insert(stockBatches)
        .values({
          productId,
          storeId,
          batchNumber,
          quantity,
          initialQuantity: quantity,
          unitCost,
          entryDate: new Date(entryDate),
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          supplier,
          notes,
        })
        .returning();

      // Atualizar estoque da loja
      const { productStocks } = await import("../drizzle/schema");
      
      // Verificar se já existe registro de estoque
      const [existingStock] = await db
        .select()
        .from(productStocks)
        .where(
          and(
            eq(productStocks.productId, productId),
            eq(productStocks.storeId, storeId)
          )
        )
        .limit(1);

      if (existingStock) {
        // Atualizar estoque existente
        await db
          .update(productStocks)
          .set({
            quantity: sql`${productStocks.quantity} + ${quantity}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(productStocks.productId, productId),
              eq(productStocks.storeId, storeId)
            )
          );
      } else {
        // Criar novo registro de estoque
        await db.insert(productStocks).values({
          productId,
          storeId,
          quantity,
        });
      }

      // Registrar movimentação de entrada
      await db.insert(stockMovements).values({
        productId,
        storeId,
        batchId: batch.id,
        movementType: "entry",
        quantity,
        unitCost,
        reason: `Batch ${batchNumber} created`,
        userId: ctx.user?.id,
        notes: `Batch entry. Expiry: ${expiryDate || "N/A"}`,
      });

      // Atualizar custo médio ponderado do produto
      await updateAverageCost(productId);

      return {
        success: true,
        batch,
      };
    }),

  /**
   * Listar lotes
   * 
   * Lista lotes com filtros opcionais
   * 
   * @param productId - Filtrar por produto (opcional)
   * @param storeId - Filtrar por loja (opcional)
   * @param onlyActive - Apenas lotes com quantidade > 0 (opcional)
   * @param expiringInDays - Lotes que vencem em X dias (opcional)
   */
  list: protectedProcedure
    .input(
      z.object({
        productId: z.number().optional(),
        storeId: z.number().optional(),
        onlyActive: z.boolean().optional(),
        expiringInDays: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { productId, storeId, onlyActive, expiringInDays } = input;

      const conditions = [];

      if (productId) {
        conditions.push(eq(stockBatches.productId, productId));
      }

      if (storeId) {
        conditions.push(eq(stockBatches.storeId, storeId));
      }

      if (onlyActive) {
        conditions.push(sql`${stockBatches.quantity} > 0`);
      }

      if (expiringInDays) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + expiringInDays);
        conditions.push(
          and(
            sql`${stockBatches.expiryDate} IS NOT NULL`,
            lte(stockBatches.expiryDate, futureDate),
            gte(stockBatches.expiryDate, new Date())
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const batches = await db
        .select({
          id: stockBatches.id,
          batchNumber: stockBatches.batchNumber,
          productId: stockBatches.productId,
          productName: products.name,
          productBrand: products.brand,
          storeId: stockBatches.storeId,
          storeName: stores.name,
          quantity: stockBatches.quantity,
          initialQuantity: stockBatches.initialQuantity,
          unitCost: stockBatches.unitCost,
          entryDate: stockBatches.entryDate,
          expiryDate: stockBatches.expiryDate,
          supplier: stockBatches.supplier,
          notes: stockBatches.notes,
          createdAt: stockBatches.createdAt,
          updatedAt: stockBatches.updatedAt,
        })
        .from(stockBatches)
        .innerJoin(products, eq(stockBatches.productId, products.id))
        .leftJoin(stores, eq(stockBatches.storeId, stores.id))
        .where(whereClause)
        .orderBy(asc(stockBatches.entryDate)); // FIFO: mais antigos primeiro

      // Calcular status de cada lote
      const now = new Date();
      const batchesWithStatus = batches.map((batch) => {
        let status: "active" | "depleted" | "expired" | "expiring" = "active";
        let daysToExpiry: number | null = null;

        if (batch.quantity === 0) {
          status = "depleted";
        } else if (batch.expiryDate) {
          const expiryTime = new Date(batch.expiryDate).getTime();
          const nowTime = now.getTime();
          daysToExpiry = Math.ceil((expiryTime - nowTime) / (1000 * 60 * 60 * 24));

          if (daysToExpiry < 0) {
            status = "expired";
          } else if (daysToExpiry <= 30) {
            status = "expiring";
          }
        }

        return {
          ...batch,
          status,
          daysToExpiry,
        };
      });

      return batchesWithStatus;
    }),

  /**
   * Buscar lote por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [batch] = await db
        .select()
        .from(stockBatches)
        .where(eq(stockBatches.id, input.id))
        .limit(1);

      if (!batch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Batch ${input.id} not found`,
        });
      }

      // Buscar produto e loja
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, batch.productId))
        .limit(1);

      const store = batch.storeId
        ? (await db
            .select()
            .from(stores)
            .where(eq(stores.id, batch.storeId))
            .limit(1))[0]
        : null;

      // Calcular status
      const now = new Date();
      let status: "active" | "depleted" | "expired" | "expiring" = "active";
      let daysToExpiry: number | null = null;

      if (batch.quantity === 0) {
        status = "depleted";
      } else if (batch.expiryDate) {
        const expiryTime = new Date(batch.expiryDate).getTime();
        const nowTime = now.getTime();
        daysToExpiry = Math.ceil((expiryTime - nowTime) / (1000 * 60 * 60 * 24));

        if (daysToExpiry < 0) {
          status = "expired";
        } else if (daysToExpiry <= 30) {
          status = "expiring";
        }
      }

      return {
        ...batch,
        productName: product?.name,
        productBrand: product?.brand,
        storeName: store?.name,
        status,
        daysToExpiry,
      };
    }),

  /**
   * Atualizar lote
   * 
   * Permite atualizar informações do lote (exceto quantidade)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        batchNumber: z.string().min(1).max(50).optional(),
        expiryDate: z.string().optional(), // ISO string
        supplier: z.string().max(255).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;

    // Verificar se lote existe
    const [batch] = await db
      .select()
      .from(stockBatches)
      .where(eq(stockBatches.id, id))
      .limit(1);

      if (!batch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Batch ${id} not found`,
        });
      }

      // Atualizar lote
      const [updatedBatch] = await db
        .update(stockBatches)
        .set({
          ...updates,
          expiryDate: updates.expiryDate ? new Date(updates.expiryDate) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(stockBatches.id, id))
        .returning();

      return {
        success: true,
        batch: updatedBatch,
      };
    }),

  /**
   * Baixar estoque de lote específico (FIFO manual)
   * 
   * Permite baixar quantidade de um lote específico
   */
  withdraw: protectedProcedure
    .input(
      z.object({
        batchId: z.number(),
        quantity: z.number().min(1),
        reason: z.string().optional(),
        orderId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { batchId, quantity, reason, orderId } = input;

      // Buscar lote
      const [batch] = await db
        .select()
        .from(stockBatches)
        .where(eq(stockBatches.id, batchId))
        .limit(1);

      if (!batch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Batch ${batchId} not found`,
        });
      }

      // Verificar se tem quantidade suficiente
      if (batch.quantity < quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient quantity in batch. Available: ${batch.quantity}, Requested: ${quantity}`,
        });
      }

      // Atualizar quantidade do lote
      await db
        .update(stockBatches)
        .set({
          quantity: sql`${stockBatches.quantity} - ${quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(stockBatches.id, batchId));

      // Atualizar estoque da loja
      const { productStocks } = await import("../drizzle/schema");
      await db
        .update(productStocks)
        .set({
          quantity: sql`${productStocks.quantity} - ${quantity}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(productStocks.productId, batch.productId),
            eq(productStocks.storeId, batch.storeId!)
          )
        );

      // Registrar movimentação
      await db.insert(stockMovements).values({
        productId: batch.productId,
        storeId: batch.storeId,
        batchId: batch.id,
        movementType: "exit",
        quantity: -quantity,
        reason: reason || `Batch ${batch.batchNumber} withdrawal`,
        orderId,
        userId: ctx.user?.id,
        notes: `FIFO withdrawal from batch ${batch.batchNumber}`,
      });

      return {
        success: true,
        batchId: batch.id,
        remainingQuantity: batch.quantity - quantity,
      };
    }),

  /**
   * Baixar estoque com FIFO automático
   * 
   * Baixa estoque automaticamente dos lotes mais antigos (FIFO)
   */
  withdrawFIFO: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        storeId: z.number(),
        quantity: z.number().min(1),
        reason: z.string().optional(),
        orderId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { productId, storeId, quantity, reason, orderId } = input;

      // Buscar lotes disponíveis (FIFO: mais antigos primeiro)
      const availableBatches = await db
        .select()
        .from(stockBatches)
        .where(
          and(
            eq(stockBatches.productId, productId),
            eq(stockBatches.storeId, storeId),
            sql`${stockBatches.quantity} > 0`
          )
        )
        .orderBy(asc(stockBatches.entryDate));

      if (availableBatches.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No batches available for product ${productId} in store ${storeId}`,
        });
      }

      // Calcular total disponível
      const totalAvailable = availableBatches.reduce(
        (sum, batch) => sum + batch.quantity,
        0
      );

      if (totalAvailable < quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient stock. Available: ${totalAvailable}, Requested: ${quantity}`,
        });
      }

      // Baixar dos lotes (FIFO)
      let remaining = quantity;
      const withdrawals = [];

      for (const batch of availableBatches) {
        if (remaining === 0) break;

        const toWithdraw = Math.min(remaining, batch.quantity);

        // Atualizar lote
        await db
          .update(stockBatches)
          .set({
            quantity: sql`${stockBatches.quantity} - ${toWithdraw}`,
            updatedAt: new Date(),
          })
          .where(eq(stockBatches.id, batch.id));

        // Registrar movimentação
        await db.insert(stockMovements).values({
          productId,
          storeId,
          batchId: batch.id,
          movementType: "sale",
          quantity: -toWithdraw,
          reason: reason || "FIFO automatic withdrawal",
          orderId,
          userId: ctx.user?.id,
          notes: `FIFO: ${toWithdraw} from batch ${batch.batchNumber}`,
        });

        withdrawals.push({
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          quantity: toWithdraw,
        });

        remaining -= toWithdraw;
      }

      // Atualizar estoque total da loja
      const { productStocks } = await import("../drizzle/schema");
      await db
        .update(productStocks)
        .set({
          quantity: sql`${productStocks.quantity} - ${quantity}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(productStocks.productId, productId),
            eq(productStocks.storeId, storeId)
          )
        );

      return {
        success: true,
        totalWithdrawn: quantity,
        withdrawals,
      };
    }),

  /**
   * Rastreabilidade de lote
   * 
   * Retorna histórico completo de um lote: NF-e → Lote → Vendas
   */
  traceability: protectedProcedure
    .input(z.object({ batchId: z.number() }))
    .query(async ({ input }) => {
      const { batchId } = input;

      // Buscar lote
      const [batch] = await db
        .select()
        .from(stockBatches)
        .where(eq(stockBatches.id, batchId))
        .limit(1);

      if (!batch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Batch ${batchId} not found`,
        });
      }

      // Buscar produto
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, batch.productId))
        .limit(1);

      // Buscar loja
      const store = batch.storeId
        ? (await db
            .select()
            .from(stores)
            .where(eq(stores.id, batch.storeId))
            .limit(1))[0]
        : null;

      // Buscar todas as movimentações deste lote
      const movements = await db
        .select({
          id: stockMovements.id,
          movementType: stockMovements.movementType,
          quantity: stockMovements.quantity,
          reason: stockMovements.reason,
          notes: stockMovements.notes,
          orderId: stockMovements.orderId,
          createdAt: stockMovements.createdAt,
        })
        .from(stockMovements)
        .where(eq(stockMovements.batchId, batchId))
        .orderBy(desc(stockMovements.createdAt));

      // Buscar pedidos relacionados
      const orderIds = movements
        .filter((m) => m.orderId)
        .map((m) => m.orderId!);

      const relatedOrders = orderIds.length > 0
        ? await db
            .select()
            .from(orders)
            .where(sql`${orders.id} IN (${sql.join(orderIds.map(id => sql`${id}`), sql`, `)})`)
        : [];

      // Calcular estatísticas
      const totalIn = movements
        .filter((m) => m.quantity > 0)
        .reduce((sum, m) => sum + m.quantity, 0);

      const totalOut = movements
        .filter((m) => m.quantity < 0)
        .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

      // Extrair informações da NF-e das notas
      const nfeInfo = batch.notes?.match(/NF-e (\d+)\/(\d+).*Chave: ([\w]+)/);
      const nfeData = nfeInfo
        ? {
            numero: nfeInfo[1],
            serie: nfeInfo[2],
            chave: nfeInfo[3],
          }
        : null;

      return {
        batch: {
          id: batch.id,
          batchNumber: batch.batchNumber,
          productId: batch.productId,
          productName: product?.name,
          productBrand: product?.brand,
          storeId: batch.storeId,
          storeName: store?.name,
          quantity: batch.quantity,
          initialQuantity: batch.initialQuantity,
          unitCost: batch.unitCost,
          entryDate: batch.entryDate,
          expiryDate: batch.expiryDate,
          supplier: batch.supplier,
          notes: batch.notes,
        },
        nfe: nfeData,
        movements: movements.map((m) => ({
          ...m,
          order: relatedOrders.find((o) => o.id === m.orderId),
        })),
        stats: {
          totalIn,
          totalOut,
          current: batch.quantity,
          utilizationRate: ((totalOut / batch.initialQuantity) * 100).toFixed(1) + "%",
        },
      };
    }),

  /**
   * Alertas de validade
   * 
   * Retorna lotes próximos ao vencimento ou vencidos
   */
  expiryAlerts: protectedProcedure
    .input(
      z.object({
        storeId: z.number().optional(),
        daysThreshold: z.number().default(30), // Alertar produtos que vencem em X dias
      })
    )
    .query(async ({ input }) => {
      const { storeId, daysThreshold } = input;

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysThreshold);

      const conditions = [
        sql`${stockBatches.expiryDate} IS NOT NULL`,
        lte(stockBatches.expiryDate, futureDate),
        sql`${stockBatches.quantity} > 0`, // Apenas lotes com estoque
      ];

      if (storeId) {
        conditions.push(eq(stockBatches.storeId, storeId));
      }

      const expiringBatches = await db
        .select({
          id: stockBatches.id,
          batchNumber: stockBatches.batchNumber,
          productId: stockBatches.productId,
          productName: products.name,
          productBrand: products.brand,
          storeId: stockBatches.storeId,
          storeName: stores.name,
          quantity: stockBatches.quantity,
          expiryDate: stockBatches.expiryDate,
        })
        .from(stockBatches)
        .innerJoin(products, eq(stockBatches.productId, products.id))
        .leftJoin(stores, eq(stockBatches.storeId, stores.id))
        .where(and(...conditions))
        .orderBy(asc(stockBatches.expiryDate));

      // Calcular dias até vencimento
      const now = new Date();
      const batchesWithDays = expiringBatches.map((batch) => {
        const expiryTime = new Date(batch.expiryDate!).getTime();
        const nowTime = now.getTime();
        const daysToExpiry = Math.ceil((expiryTime - nowTime) / (1000 * 60 * 60 * 24));

        return {
          ...batch,
          daysToExpiry,
          isExpired: daysToExpiry < 0,
          severity: daysToExpiry < 0 ? "critical" : daysToExpiry <= 7 ? "high" : "medium",
        };
      });

      // Estatísticas
      const expired = batchesWithDays.filter((b) => b.isExpired);
      const expiringSoon = batchesWithDays.filter((b) => !b.isExpired && b.daysToExpiry <= 7);
      const expiringLater = batchesWithDays.filter((b) => !b.isExpired && b.daysToExpiry > 7);

      return {
        batches: batchesWithDays,
        stats: {
          total: batchesWithDays.length,
          expired: expired.length,
          expiringSoon: expiringSoon.length,
          expiringLater: expiringLater.length,
        },
      };
    }),
});

/**
 * Atualizar custo médio ponderado de um produto
 * 
 * Calcula o custo médio baseado nos lotes ativos
 */
async function updateAverageCost(productId: number) {
  // Buscar todos os lotes ativos do produto
  const activeBatches = await db
    .select({
      quantity: stockBatches.quantity,
      unitCost: stockBatches.unitCost,
    })
    .from(stockBatches)
    .where(
      and(
        eq(stockBatches.productId, productId),
        sql`${stockBatches.quantity} > 0`
      )
    );

  if (activeBatches.length === 0) {
    return;
  }

  // Calcular custo médio ponderado
  const totalQuantity = activeBatches.reduce((sum, b) => sum + b.quantity, 0);
  const totalCost = activeBatches.reduce(
    (sum, b) => sum + b.quantity * b.unitCost,
    0
  );
  const averageCost = Math.round(totalCost / totalQuantity);

  // Atualizar produto
  await db
    .update(products)
    .set({ averageCost })
    .where(eq(products.id, productId));
}
