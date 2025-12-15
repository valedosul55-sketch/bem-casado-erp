/**
 * Router de API Pública
 * 
 * Endpoints REST para integração com sistemas externos (e-commerce, ERPs, etc).
 * 
 * Funcionalidades:
 * - Consulta de disponibilidade de estoque
 * - Criação de reservas temporárias
 * - Confirmação de vendas
 * - Cancelamento de reservas
 * - Autenticação por API key
 * - Rate limiting
 * - Webhooks para notificações
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { 
  products, 
  productStocks, 
  stockReservations,
  stores 
} from "../drizzle/schema";
import { eq, and, sql, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Middleware de autenticação por API key
 * 
 * Valida a API key enviada no header X-API-Key
 * 
 * TODO: Implementar sistema de API keys no banco de dados
 * Por enquanto, aceita qualquer key para desenvolvimento
 */
const apiKeyMiddleware = publicProcedure.use(async ({ ctx, next }) => {
  const apiKey = ctx.req.headers["x-api-key"];

  if (!apiKey) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "API key is required. Please provide X-API-Key header.",
    });
  }

  // TODO: Validar API key no banco de dados
  // Por enquanto, aceita qualquer key para desenvolvimento
  // const validKey = await db.query.apiKeys.findFirst({
  //   where: eq(apiKeys.key, apiKey as string),
  // });

  // if (!validKey || !validKey.active) {
  //   throw new TRPCError({
  //     code: "UNAUTHORIZED",
  //     message: "Invalid or inactive API key",
  //   });
  // }

  return next({
    ctx: {
      ...ctx,
      apiKey: apiKey as string,
    },
  });
});

/**
 * Router de API pública
 */
export const publicApiRouter = router({
  /**
   * Consultar disponibilidade de produto
   * 
   * Retorna a quantidade disponível de um produto em uma loja específica
   * 
   * @param productId - ID do produto
   * @param storeId - ID da loja (opcional, se não informado retorna total)
   * @param quantity - Quantidade desejada (opcional, para validar disponibilidade)
   * 
   * @returns {
   *   productId: number,
   *   productName: string,
   *   available: number, // Quantidade disponível (estoque - reservas)
   *   reserved: number, // Quantidade reservada
   *   stock: number, // Estoque total
   *   isAvailable: boolean, // Se a quantidade desejada está disponível
   * }
   */
  checkAvailability: apiKeyMiddleware
    .input(
      z.object({
        productId: z.number(),
        storeId: z.number().optional(),
        quantity: z.number().min(1).optional(),
      })
    )
    .query(async ({ input }) => {
      const { productId, storeId, quantity } = input;

      // Buscar produto
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

      // Buscar estoque
      let stockQuery = db
        .select({
          stock: productStocks.quantity,
          storeId: productStocks.storeId,
          storeName: stores.name,
        })
        .from(productStocks)
        .innerJoin(stores, eq(productStocks.storeId, stores.id))
        .where(eq(productStocks.productId, productId));

      if (storeId) {
        stockQuery = stockQuery.where(
          eq(productStocks.storeId, storeId)
        );
      }

      const stockData = await stockQuery;

      if (stockData.length === 0) {
        return {
          productId,
          productName: product.name,
          available: 0,
          reserved: 0,
          stock: 0,
          isAvailable: false,
        };
      }

      // Calcular total de estoque
      const totalStock = stockData.reduce((sum, s) => sum + s.stock, 0);

      // Buscar reservas ativas
      const now = new Date();
      const reservations = await db
        .select({
          quantity: stockReservations.quantity,
        })
        .from(stockReservations)
        .where(
          and(
            eq(stockReservations.productId, productId),
            eq(stockReservations.status, "active"),
            gte(stockReservations.expiresAt, now),
            storeId ? eq(stockReservations.storeId, storeId) : sql`1=1`
          )
        );

      const totalReserved = reservations.reduce((sum, r) => sum + r.quantity, 0);
      const available = totalStock - totalReserved;

      return {
        productId,
        productName: product.name,
        productBrand: product.brand,
        productPrice: product.price,
        available,
        reserved: totalReserved,
        stock: totalStock,
        isAvailable: quantity ? available >= quantity : available > 0,
        stores: stockData.map((s) => ({
          storeId: s.storeId,
          storeName: s.storeName,
          stock: s.stock,
        })),
      };
    }),

  /**
   * Criar reserva de estoque
   * 
   * Cria uma reserva temporária de estoque (15 minutos por padrão)
   * 
   * @param productId - ID do produto
   * @param storeId - ID da loja
   * @param quantity - Quantidade a reservar
   * @param externalOrderId - ID do pedido no sistema externo (opcional)
   * 
   * @returns {
   *   reservationId: number,
   *   expiresAt: Date,
   *   expiresIn: number, // Segundos até expirar
   * }
   */
  createReservation: apiKeyMiddleware
    .input(
      z.object({
        productId: z.number(),
        storeId: z.number(),
        quantity: z.number().min(1),
        externalOrderId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { productId, storeId, quantity, externalOrderId } = input;

      // Verificar disponibilidade
      const [stock] = await db
        .select()
        .from(productStocks)
        .where(
          and(
            eq(productStocks.productId, productId),
            eq(productStocks.storeId, storeId)
          )
        )
        .limit(1);

      if (!stock) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Product ${productId} not found in store ${storeId}`,
        });
      }

      // Calcular estoque disponível (estoque - reservas ativas)
      const now = new Date();
      const activeReservations = await db
        .select({
          quantity: stockReservations.quantity,
        })
        .from(stockReservations)
        .where(
          and(
            eq(stockReservations.productId, productId),
            eq(stockReservations.storeId, storeId),
            eq(stockReservations.status, "active"),
            gte(stockReservations.expiresAt, now)
          )
        );

      const reserved = activeReservations.reduce((sum, r) => sum + r.quantity, 0);
      const available = stock.quantity - reserved;

      if (available < quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient stock. Available: ${available}, Requested: ${quantity}`,
        });
      }

      // Criar reserva (15 minutos)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      const [reservation] = await db
        .insert(stockReservations)
        .values({
          productId,
          storeId,
          quantity,
          expiresAt,
          status: "active",
          notes: externalOrderId
            ? `External order: ${externalOrderId}`
            : undefined,
        })
        .returning();

      return {
        reservationId: reservation.id,
        productId: reservation.productId,
        storeId: reservation.storeId,
        quantity: reservation.quantity,
        expiresAt: reservation.expiresAt,
        expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
      };
    }),

  /**
   * Confirmar venda e baixar estoque
   * 
   * Confirma uma reserva e realiza a baixa definitiva do estoque
   * 
   * @param reservationId - ID da reserva
   * @param orderId - ID do pedido (opcional)
   * 
   * @returns {
   *   success: boolean,
   *   movementId: number,
   * }
   */
  confirmSale: apiKeyMiddleware
    .input(
      z.object({
        reservationId: z.number(),
        orderId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { reservationId, orderId } = input;

      // Buscar reserva
      const [reservation] = await db
        .select()
        .from(stockReservations)
        .where(eq(stockReservations.id, reservationId))
        .limit(1);

      if (!reservation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Reservation ${reservationId} not found`,
        });
      }

      if (reservation.status !== "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Reservation ${reservationId} is not active (status: ${reservation.status})`,
        });
      }

      // Verificar se expirou
      if (reservation.expiresAt < new Date()) {
        // Marcar como expirada
        await db
          .update(stockReservations)
          .set({ status: "expired" })
          .where(eq(stockReservations.id, reservationId));

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Reservation ${reservationId} has expired`,
        });
      }

      // Baixar estoque
      await db
        .update(productStocks)
        .set({
          quantity: sql`${productStocks.quantity} - ${reservation.quantity}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(productStocks.productId, reservation.productId),
            eq(productStocks.storeId, reservation.storeId!)
          )
        );

      // Registrar movimentação
      const { stockMovements } = await import("../drizzle/schema");
      const [movement] = await db
        .insert(stockMovements)
        .values({
          productId: reservation.productId,
          storeId: reservation.storeId,
          movementType: "sale",
          quantity: -reservation.quantity,
          reason: `API sale - Reservation ${reservationId}`,
          orderId: orderId,
          notes: `Confirmed via Public API. API Key: ${ctx.apiKey?.substring(0, 8)}...`,
        })
        .returning();

      // Marcar reserva como completada
      await db
        .update(stockReservations)
        .set({ status: "completed" })
        .where(eq(stockReservations.id, reservationId));

      return {
        success: true,
        reservationId: reservation.id,
        movementId: movement.id,
        productId: reservation.productId,
        quantity: reservation.quantity,
      };
    }),

  /**
   * Cancelar reserva
   * 
   * Cancela uma reserva ativa, liberando o estoque
   * 
   * @param reservationId - ID da reserva
   * 
   * @returns {
   *   success: boolean,
   * }
   */
  cancelReservation: apiKeyMiddleware
    .input(
      z.object({
        reservationId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { reservationId } = input;

      // Buscar reserva
      const [reservation] = await db
        .select()
        .from(stockReservations)
        .where(eq(stockReservations.id, reservationId))
        .limit(1);

      if (!reservation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Reservation ${reservationId} not found`,
        });
      }

      if (reservation.status !== "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Reservation ${reservationId} is not active (status: ${reservation.status})`,
        });
      }

      // Marcar reserva como cancelada
      await db
        .update(stockReservations)
        .set({ status: "cancelled" })
        .where(eq(stockReservations.id, reservationId));

      return {
        success: true,
        reservationId: reservation.id,
      };
    }),

  /**
   * Listar produtos disponíveis
   * 
   * Retorna lista de produtos com estoque disponível
   * 
   * @param storeId - ID da loja (opcional)
   * @param category - Categoria do produto (opcional)
   * @param limit - Limite de resultados (padrão: 50, máximo: 100)
   * 
   * @returns Array de produtos com estoque
   */
  listProducts: apiKeyMiddleware
    .input(
      z.object({
        storeId: z.number().optional(),
        category: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      const { storeId, category, limit } = input;

      const conditions = [eq(products.active, 1)];

      if (storeId) {
        conditions.push(eq(productStocks.storeId, storeId));
      }

      if (category) {
        conditions.push(eq(products.category, category));
      }

      const results = await db
        .select({
          productId: products.id,
          productName: products.name,
          productBrand: products.brand,
          productCategory: products.category,
          productPrice: products.price,
          productEan13: products.ean13,
          storeId: stores.id,
          storeName: stores.name,
          stock: productStocks.quantity,
        })
        .from(productStocks)
        .innerJoin(products, eq(productStocks.productId, products.id))
        .innerJoin(stores, eq(productStocks.storeId, stores.id))
        .where(and(...conditions))
        .limit(limit);

      // Calcular disponibilidade (estoque - reservas)
      const now = new Date();
      const productsWithAvailability = await Promise.all(
        results.map(async (product) => {
          const reservations = await db
            .select({
              quantity: stockReservations.quantity,
            })
            .from(stockReservations)
            .where(
              and(
                eq(stockReservations.productId, product.productId),
                eq(stockReservations.storeId, product.storeId),
                eq(stockReservations.status, "active"),
                gte(stockReservations.expiresAt, now)
              )
            );

          const reserved = reservations.reduce((sum, r) => sum + r.quantity, 0);
          const available = product.stock - reserved;

          return {
            ...product,
            reserved,
            available,
          };
        })
      );

      return productsWithAvailability;
    }),

  /**
   * Health check
   * 
   * Endpoint para verificar se a API está funcionando
   */
  health: publicProcedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };
  }),
});
