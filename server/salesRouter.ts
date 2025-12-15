/**
 * Router de Vendas com Baixa Automática de Estoque
 * 
 * Gerencia todo o ciclo de vendas:
 * 1. Reserva de estoque ao criar pedido
 * 2. Baixa automática ao confirmar pagamento
 * 3. Cancelamento com devolução ao estoque
 * 4. Validações de estoque disponível
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { db } from "./db";
import { 
  orders, 
  orderItems, 
  products, 
  productStocks, 
  stockMovements,
  stockReservations,
  stockBatches
} from "../drizzle/schema";
import { eq, and, sql, lt, asc } from "drizzle-orm";

/**
 * Cria reserva de estoque para um pedido
 */
async function createStockReservation(
  productId: number,
  storeId: number,
  quantity: number,
  orderId?: number
): Promise<{ success: boolean; reservationId?: number; error?: string }> {
  try {
    // Verificar estoque disponível (considerando reservas ativas)
    const available = await getAvailableStock(productId, storeId);
    
    if (available < quantity) {
      return {
        success: false,
        error: `Estoque insuficiente. Disponível: ${available}, Solicitado: ${quantity}`
      };
    }
    
    // Criar reserva com expiração de 15 minutos
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    
    const [reservation] = await db.insert(stockReservations).values({
      productId,
      storeId,
      orderId,
      quantity,
      status: 'active',
      expiresAt
    }).returning();
    
    console.log(`[RESERVATION] Criada: ${reservation.id} - Produto ${productId}, Qtd: ${quantity}`);
    
    return {
      success: true,
      reservationId: reservation.id
    };
    
  } catch (error) {
    console.error('[RESERVATION] Erro ao criar reserva:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Calcula estoque disponível (estoque físico - reservas ativas)
 */
async function getAvailableStock(productId: number, storeId: number): Promise<number> {
  // Buscar estoque físico
  const [stock] = await db
    .select()
    .from(productStocks)
    .where(and(
      eq(productStocks.productId, productId),
      eq(productStocks.storeId, storeId)
    ));
  
  if (!stock) {
    return 0;
  }
  
  // Buscar reservas ativas (não expiradas)
  const now = new Date();
  const reservations = await db
    .select()
    .from(stockReservations)
    .where(and(
      eq(stockReservations.productId, productId),
      eq(stockReservations.storeId, storeId),
      eq(stockReservations.status, 'active'),
      sql`${stockReservations.expiresAt} > ${now}`
    ));
  
  const reservedQuantity = reservations.reduce((sum, r) => sum + r.quantity, 0);
  
  return Math.max(0, stock.quantity - reservedQuantity);
}

/**
 * Baixa de estoque usando Custo Médio Ponderado
 */
async function withdrawAverageCost(
  productId: number,
  storeId: number,
  quantity: number,
  orderId: number
): Promise<{ success: boolean; error?: string; averageCost?: number }> {
  try {
    // Buscar produto para obter custo médio
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!product) {
      return { success: false, error: 'Produto não encontrado' };
    }

    const averageCost = product.averageCost || 0;

    // Buscar lotes disponíveis para baixa (qualquer ordem, pois usa custo médio)
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
      .orderBy(asc(stockBatches.entryDate)); // Mantém FIFO físico mesmo usando custo médio

    if (availableBatches.length === 0) {
      return { success: false, error: 'Nenhum lote disponível para este produto' };
    }

    // Calcular total disponível
    const totalAvailable = availableBatches.reduce((sum, batch) => sum + batch.quantity, 0);

    if (totalAvailable < quantity) {
      return {
        success: false,
        error: `Estoque insuficiente. Disponível: ${totalAvailable}, Solicitado: ${quantity}`
      };
    }

    // Baixar dos lotes (FIFO físico, mas com custo médio)
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
          updatedAt: new Date()
        })
        .where(eq(stockBatches.id, batch.id));

      // Registrar movimentação com CUSTO MÉDIO (não o custo do lote)
      await db.insert(stockMovements).values({
        productId,
        storeId,
        batchId: batch.id,
        movementType: 'sale',
        quantity: -toWithdraw,
        unitCost: averageCost, // USA CUSTO MÉDIO, NÃO O CUSTO DO LOTE
        reason: 'Venda confirmada (Custo Médio)',
        orderId,
        notes: `Método: Custo Médio | ${toWithdraw} do lote ${batch.batchNumber} | CMV: R$ ${(averageCost * toWithdraw / 100).toFixed(2)}`
      });

      withdrawals.push({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        quantity: toWithdraw
      });

      remaining -= toWithdraw;
    }

    // Atualizar estoque total da loja
    await db
      .update(productStocks)
      .set({
        quantity: sql`${productStocks.quantity} - ${quantity}`,
        updatedAt: new Date()
      })
      .where(and(
        eq(productStocks.productId, productId),
        eq(productStocks.storeId, storeId)
      ));

    console.log(`[SALE] Baixa por Custo Médio: Produto ${productId}, Qtd: ${quantity}, Custo Médio: R$ ${(averageCost / 100).toFixed(2)}`);
    console.log(`[SALE] Lotes utilizados:`, withdrawals);

    return { success: true, averageCost };

  } catch (error) {
    console.error('[SALE] Erro ao baixar por custo médio:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Baixa de estoque usando FIFO (First In, First Out)
 */
async function withdrawFIFO(
  productId: number,
  storeId: number,
  quantity: number,
  orderId: number
): Promise<{ success: boolean; error?: string }> {
  try {
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
      return { success: false, error: 'Nenhum lote disponível para este produto' };
    }

    // Calcular total disponível
    const totalAvailable = availableBatches.reduce((sum, batch) => sum + batch.quantity, 0);

    if (totalAvailable < quantity) {
      return {
        success: false,
        error: `Estoque insuficiente. Disponível: ${totalAvailable}, Solicitado: ${quantity}`
      };
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
          updatedAt: new Date()
        })
        .where(eq(stockBatches.id, batch.id));

      // Registrar movimentação com custo do lote (FIFO)
      await db.insert(stockMovements).values({
        productId,
        storeId,
        batchId: batch.id,
        movementType: 'sale',
        quantity: -toWithdraw,
        unitCost: batch.unitCost, // USA CUSTO DO LOTE
        reason: 'Venda confirmada (FIFO)',
        orderId,
        notes: `Método: FIFO | ${toWithdraw} do lote ${batch.batchNumber} | CMV: R$ ${(batch.unitCost * toWithdraw / 100).toFixed(2)}`
      });

      withdrawals.push({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        quantity: toWithdraw
      });

      remaining -= toWithdraw;
    }

    // Atualizar estoque total da loja
    await db
      .update(productStocks)
      .set({
        quantity: sql`${productStocks.quantity} - ${quantity}`,
        updatedAt: new Date()
      })
      .where(and(
        eq(productStocks.productId, productId),
        eq(productStocks.storeId, storeId)
      ));

    console.log(`[SALE] Baixa FIFO: Produto ${productId}, Qtd: ${quantity}`);
    console.log(`[SALE] Lotes utilizados:`, withdrawals);

    return { success: true };

  } catch (error) {
    console.error('[SALE] Erro ao baixar por FIFO:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Completa reserva e faz baixa no estoque (usa método configurado na loja)
 */
async function completeReservationAndUpdateStock(
  reservationId: number,
  orderId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Buscar reserva
    const [reservation] = await db
      .select()
      .from(stockReservations)
      .where(eq(stockReservations.id, reservationId));
    
    if (!reservation) {
      return { success: false, error: 'Reserva não encontrada' };
    }
    
    if (reservation.status !== 'active') {
      return { success: false, error: `Reserva já está ${reservation.status}` };
    }
    
    // Buscar configuração da loja
    const { stores } = await import("../drizzle/schema");
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, reservation.storeId));
    
    if (!store) {
      return { success: false, error: 'Loja não encontrada' };
    }
    
    // Usar método configurado na loja
    const valuationMethod = store.stockValuationMethod || 'fifo';
    
    console.log(`[SALE] Método de valoração: ${valuationMethod}`);
    
    let result;
    
    if (valuationMethod === 'average_cost') {
      // Usar Custo Médio Ponderado
      result = await withdrawAverageCost(
        reservation.productId,
        reservation.storeId,
        reservation.quantity,
        orderId
      );
    } else {
      // Usar FIFO (padrão)
      result = await withdrawFIFO(
        reservation.productId,
        reservation.storeId,
        reservation.quantity,
        orderId
      );
    }
    
    if (!result.success) {
      return result;
    }
    
    // Marcar reserva como completada
    await db
      .update(stockReservations)
      .set({
        status: 'completed',
        orderId,
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(stockReservations.id, reservationId));
    
    console.log(`[SALE] Reserva ${reservationId} completada com sucesso`);
    
    return { success: true };
    
  } catch (error) {
    console.error('[SALE] Erro ao completar reserva:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Cancela reserva e devolve ao estoque
 */
async function cancelReservation(
  reservationId: number,
  reason: string = 'Cancelamento de pedido'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Buscar reserva
    const [reservation] = await db
      .select()
      .from(stockReservations)
      .where(eq(stockReservations.id, reservationId));
    
    if (!reservation) {
      return { success: false, error: 'Reserva não encontrada' };
    }
    
    if (reservation.status === 'completed') {
      // Se já foi completada, precisa devolver ao estoque
      await db
        .update(productStocks)
        .set({
          quantity: sql`${productStocks.quantity} + ${reservation.quantity}`,
          updatedAt: new Date()
        })
        .where(and(
          eq(productStocks.productId, reservation.productId),
          eq(productStocks.storeId, reservation.storeId)
        ));
      
      // Registrar movimentação de cancelamento
      await db.insert(stockMovements).values({
        productId: reservation.productId,
        storeId: reservation.storeId,
        movementType: 'sale_cancellation',
        quantity: reservation.quantity, // Positivo para entrada
        reason,
        orderId: reservation.orderId || undefined
      });
      
      console.log(`[CANCELLATION] Devolução ao estoque: Produto ${reservation.productId}, Qtd: ${reservation.quantity}`);
    }
    
    // Marcar reserva como cancelada
    await db
      .update(stockReservations)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(stockReservations.id, reservationId));
    
    return { success: true };
    
  } catch (error) {
    console.error('[CANCELLATION] Erro ao cancelar reserva:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Limpa reservas expiradas
 */
async function cleanExpiredReservations(): Promise<number> {
  try {
    const now = new Date();
    
    // Buscar reservas expiradas
    const expiredReservations = await db
      .select()
      .from(stockReservations)
      .where(and(
        eq(stockReservations.status, 'active'),
        lt(stockReservations.expiresAt, now)
      ));
    
    // Marcar como expiradas
    for (const reservation of expiredReservations) {
      await db
        .update(stockReservations)
        .set({
          status: 'expired',
          updatedAt: new Date()
        })
        .where(eq(stockReservations.id, reservation.id));
    }
    
    console.log(`[CLEANUP] ${expiredReservations.length} reservas expiradas limpas`);
    
    return expiredReservations.length;
    
  } catch (error) {
    console.error('[CLEANUP] Erro ao limpar reservas:', error);
    return 0;
  }
}

export const salesRouter = router({
  
  /**
   * Verifica disponibilidade de estoque para um produto
   */
  checkAvailability: protectedProcedure
    .input(z.object({
      productId: z.number(),
      storeId: z.number(),
      quantity: z.number().positive()
    }))
    .query(async ({ input }: any) => {
      const available = await getAvailableStock(input.productId, input.storeId);
      
      return {
        available,
        isAvailable: available >= input.quantity,
        requested: input.quantity
      };
    }),
  
  /**
   * Cria reserva de estoque (ao adicionar ao carrinho ou criar pedido)
   */
  createReservation: protectedProcedure
    .input(z.object({
      productId: z.number(),
      storeId: z.number(),
      quantity: z.number().positive(),
      orderId: z.number().optional()
    }))
    .mutation(async ({ input }: any) => {
      return await createStockReservation(
        input.productId,
        input.storeId,
        input.quantity,
        input.orderId
      );
    }),
  
  /**
   * Confirma venda e faz baixa automática no estoque
   */
  confirmSale: protectedProcedure
    .input(z.object({
      orderId: z.number(),
      reservationIds: z.array(z.number())
    }))
    .mutation(async ({ input }: any) => {
      const results = [];
      
      for (const reservationId of input.reservationIds) {
        const result = await completeReservationAndUpdateStock(
          reservationId,
          input.orderId
        );
        results.push({ reservationId, ...result });
      }
      
      const allSuccess = results.every(r => r.success);
      
      return {
        success: allSuccess,
        results
      };
    }),
  
  /**
   * Cancela pedido e devolve estoque
   */
  cancelSale: protectedProcedure
    .input(z.object({
      orderId: z.number(),
      reason: z.string().optional()
    }))
    .mutation(async ({ input }: any) => {
      // Buscar reservas do pedido
      const reservations = await db
        .select()
        .from(stockReservations)
        .where(eq(stockReservations.orderId, input.orderId));
      
      const results = [];
      
      for (const reservation of reservations) {
        const result = await cancelReservation(
          reservation.id,
          input.reason || 'Cancelamento de pedido'
        );
        results.push({ reservationId: reservation.id, ...result });
      }
      
      const allSuccess = results.every(r => r.success);
      
      return {
        success: allSuccess,
        results
      };
    }),
  
  /**
   * Limpa reservas expiradas (executar via cron)
   */
  cleanExpiredReservations: protectedProcedure
    .mutation(async () => {
      const cleaned = await cleanExpiredReservations();
      
      return {
        success: true,
        cleaned
      };
    }),
  
  /**
   * Lista reservas ativas de um pedido
   */
  getOrderReservations: protectedProcedure
    .input(z.object({
      orderId: z.number()
    }))
    .query(async ({ input }: any) => {
      const reservations = await db
        .select()
        .from(stockReservations)
        .where(eq(stockReservations.orderId, input.orderId));
      
      return reservations;
    }),
  
  /**
   * Obtém estatísticas de reservas
   */
  getReservationStats: protectedProcedure
    .input(z.object({
      storeId: z.number()
    }))
    .query(async ({ input }: any) => {
      const now = new Date();
      
      const activeReservations = await db
        .select()
        .from(stockReservations)
        .where(and(
          eq(stockReservations.storeId, input.storeId),
          eq(stockReservations.status, 'active'),
          sql`${stockReservations.expiresAt} > ${now}`
        ));
      
      const totalReserved = activeReservations.reduce((sum, r) => sum + r.quantity, 0);
      
      return {
        activeCount: activeReservations.length,
        totalReserved,
        reservations: activeReservations
      };
    })
});
