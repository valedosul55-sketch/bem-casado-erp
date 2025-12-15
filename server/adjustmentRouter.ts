/**
 * Router para Ajustes Manuais de Estoque com Auditoria
 * 
 * Permite registrar ajustes manuais (positivos e negativos) com:
 * - Rastreabilidade completa (usuário, data, motivo)
 * - Validações de segurança
 * - Integração com custo médio ponderado
 * - Histórico de auditoria
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { products, stockMovements, productStocks } from "../drizzle/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { processStockEntry } from "./averageCost";

/**
 * Motivos válidos para ajustes de estoque
 */
export const AdjustmentReasons = {
  INVENTORY: "inventory", // Inventário/contagem física
  LOSS: "loss", // Perda/extravio
  DAMAGE: "damage", // Dano/avaria
  EXPIRY: "expiry", // Vencimento
  RETURN: "return", // Devolução de cliente
  CORRECTION: "correction", // Correção de erro
  TRANSFER: "transfer", // Transferência entre lojas
  SAMPLE: "sample", // Amostra grátis
  THEFT: "theft", // Furto/roubo
  OTHER: "other", // Outro motivo
} as const;

export type AdjustmentReason = typeof AdjustmentReasons[keyof typeof AdjustmentReasons];

/**
 * Labels em português para os motivos
 */
export const AdjustmentReasonLabels: Record<AdjustmentReason, string> = {
  inventory: "Inventário/Contagem Física",
  loss: "Perda/Extravio",
  damage: "Dano/Avaria",
  expiry: "Vencimento",
  return: "Devolução de Cliente",
  correction: "Correção de Erro",
  transfer: "Transferência entre Lojas",
  sample: "Amostra Grátis",
  theft: "Furto/Roubo",
  other: "Outro Motivo",
};

export const adjustmentRouter = router({
  /**
   * Registra ajuste manual de estoque (positivo ou negativo)
   */
  create: publicProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        storeId: z.number().int().positive().optional(),
        quantity: z.number().int(), // Pode ser positivo ou negativo
        reason: z.enum([
          "inventory",
          "loss",
          "damage",
          "expiry",
          "return",
          "correction",
          "transfer",
          "sample",
          "theft",
          "other",
        ]),
        notes: z.string().min(1, "Observações são obrigatórias").max(1000),
        unitCost: z.number().int().positive().optional(), // Para ajustes positivos
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validar se produto existe
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);

      if (!product) {
        throw new Error("Produto não encontrado");
      }

      // Validar estoque disponível para ajustes negativos
      if (input.quantity < 0) {
        const estoqueAtual = product.stock || 0;
        const quantidadeRetirada = Math.abs(input.quantity);

        if (quantidadeRetirada > estoqueAtual) {
          throw new Error(
            `Estoque insuficiente. Disponível: ${estoqueAtual}, Solicitado: ${quantidadeRetirada}`
          );
        }

        // Alerta para ajustes grandes (>10% do estoque)
        const percentual = (quantidadeRetirada / estoqueAtual) * 100;
        if (percentual > 10) {
          console.warn(
            `[AJUSTE GRANDE] Produto: ${product.name}, Quantidade: ${quantidadeRetirada} (${percentual.toFixed(1)}% do estoque)`
          );
        }
      }

      // Determinar tipo de movimentação
      const movementType = input.quantity > 0 ? "entry" : "exit";

      // Registrar movimentação
      const [movement] = await db
        .insert(stockMovements)
        .values({
          productId: input.productId,
          storeId: input.storeId || null,
          movementType: "adjustment",
          quantity: input.quantity,
          unitCost: input.unitCost || null,
          reason: input.reason,
          userId: ctx.user?.id || null,
          notes: input.notes,
        })
        .returning();

      // Atualizar estoque do produto
      const novoEstoque = (product.stock || 0) + input.quantity;
      await db
        .update(products)
        .set({
          stock: novoEstoque,
          updatedAt: new Date(),
        })
        .where(eq(products.id, input.productId));

      // Se for entrada com custo, atualizar custo médio
      if (input.quantity > 0 && input.unitCost) {
        await processStockEntry(input.productId, input.quantity, input.unitCost);
      }

      // Atualizar estoque por loja (se storeId fornecido)
      if (input.storeId) {
        const [stockByStore] = await db
          .select()
          .from(productStocks)
          .where(
            and(
              eq(productStocks.productId, input.productId),
              eq(productStocks.storeId, input.storeId)
            )
          )
          .limit(1);

        if (stockByStore) {
          await db
            .update(productStocks)
            .set({
              quantity: (stockByStore.quantity || 0) + input.quantity,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(productStocks.productId, input.productId),
                eq(productStocks.storeId, input.storeId)
              )
            );
        } else {
          // Criar registro se não existir
          await db.insert(productStocks).values({
            productId: input.productId,
            storeId: input.storeId,
            quantity: input.quantity,
            minStock: 0,
            maxStock: 1000,
          });
        }
      }

      return {
        success: true,
        message: `Ajuste registrado com sucesso. Novo estoque: ${novoEstoque}`,
        movement,
        newStock: novoEstoque,
      };
    }),

  /**
   * Lista histórico de ajustes com filtros
   */
  list: publicProcedure
    .input(
      z.object({
        productId: z.number().int().positive().optional(),
        storeId: z.number().int().positive().optional(),
        userId: z.number().int().positive().optional(),
        reason: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().int().positive().default(50),
        offset: z.number().int().nonnegative().default(0),
      })
    )
    .query(async ({ input }) => {
      // Construir condições de filtro
      const conditions: any[] = [eq(stockMovements.movementType, "adjustment")];

      if (input.productId) {
        conditions.push(eq(stockMovements.productId, input.productId));
      }

      if (input.storeId) {
        conditions.push(eq(stockMovements.storeId, input.storeId));
      }

      if (input.userId) {
        conditions.push(eq(stockMovements.userId, input.userId));
      }

      if (input.reason) {
        conditions.push(eq(stockMovements.reason, input.reason));
      }

      if (input.startDate) {
        conditions.push(gte(stockMovements.createdAt, input.startDate));
      }

      if (input.endDate) {
        conditions.push(lte(stockMovements.createdAt, input.endDate));
      }

      // Buscar ajustes
      const adjustments = await db
        .select({
          id: stockMovements.id,
          productId: stockMovements.productId,
          productName: products.name,
          storeId: stockMovements.storeId,
          quantity: stockMovements.quantity,
          unitCost: stockMovements.unitCost,
          reason: stockMovements.reason,
          notes: stockMovements.notes,
          userId: stockMovements.userId,
          createdAt: stockMovements.createdAt,
        })
        .from(stockMovements)
        .leftJoin(products, eq(stockMovements.productId, products.id))
        .where(and(...conditions))
        .orderBy(desc(stockMovements.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Contar total
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(stockMovements)
        .where(and(...conditions));

      return {
        adjustments,
        total: Number(count),
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Busca estatísticas de ajustes
   */
  stats: publicProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const conditions: any[] = [eq(stockMovements.movementType, "adjustment")];

      if (input.startDate) {
        conditions.push(gte(stockMovements.createdAt, input.startDate));
      }

      if (input.endDate) {
        conditions.push(lte(stockMovements.createdAt, input.endDate));
      }

      // Total de ajustes
      const [{ totalAdjustments }] = await db
        .select({ totalAdjustments: sql<number>`count(*)` })
        .from(stockMovements)
        .where(and(...conditions));

      // Ajustes por motivo
      const adjustmentsByReason = await db
        .select({
          reason: stockMovements.reason,
          count: sql<number>`count(*)`,
          totalQuantity: sql<number>`sum(${stockMovements.quantity})`,
        })
        .from(stockMovements)
        .where(and(...conditions))
        .groupBy(stockMovements.reason);

      // Ajustes positivos vs negativos
      const [positiveAdjustments] = await db
        .select({
          count: sql<number>`count(*)`,
          totalQuantity: sql<number>`sum(${stockMovements.quantity})`,
        })
        .from(stockMovements)
        .where(and(...conditions, sql`${stockMovements.quantity} > 0`));

      const [negativeAdjustments] = await db
        .select({
          count: sql<number>`count(*)`,
          totalQuantity: sql<number>`sum(abs(${stockMovements.quantity}))`,
        })
        .from(stockMovements)
        .where(and(...conditions, sql`${stockMovements.quantity} < 0`));

      return {
        totalAdjustments: Number(totalAdjustments),
        adjustmentsByReason,
        positiveAdjustments: {
          count: Number(positiveAdjustments?.count || 0),
          totalQuantity: Number(positiveAdjustments?.totalQuantity || 0),
        },
        negativeAdjustments: {
          count: Number(negativeAdjustments?.count || 0),
          totalQuantity: Number(negativeAdjustments?.totalQuantity || 0),
        },
      };
    }),
});
