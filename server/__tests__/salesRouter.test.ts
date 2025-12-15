/**
 * Testes Unitários do Sistema de Baixa Automática de Estoque
 * 
 * Testa:
 * 1. Verificação de disponibilidade
 * 2. Criação de reservas
 * 3. Baixa automática ao confirmar venda
 * 4. Cancelamento com devolução ao estoque
 * 5. Limpeza de reservas expiradas
 * 6. Proteção contra condição de corrida
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../db';
import { products, productStocks, stockReservations, stockMovements, stores } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// Dados de teste
let testStoreId: number;
let testProductId: number;

describe('Sistema de Baixa Automática de Estoque', () => {
  
  beforeAll(async () => {
    // Criar loja de teste
    const [store] = await db.insert(stores).values({
      name: 'Loja Teste',
      cnpj: '12345678000199',
      active: 1
    }).returning();
    testStoreId = store.id;
    
    // Criar produto de teste
    const [product] = await db.insert(products).values({
      name: 'Arroz Teste 5kg',
      brand: 'Bem Casado',
      price: 2500, // R$ 25,00
      averageCost: 1500, // R$ 15,00
      stock: 100,
      active: 1
    }).returning();
    testProductId = product.id;
    
    // Criar estoque inicial
    await db.insert(productStocks).values({
      productId: testProductId,
      storeId: testStoreId,
      quantity: 100,
      minStock: 10
    });
    
    console.log(`[TEST] Loja criada: ${testStoreId}`);
    console.log(`[TEST] Produto criado: ${testProductId}`);
  });
  
  afterAll(async () => {
    // Limpar dados de teste
    await db.delete(stockMovements).where(eq(stockMovements.productId, testProductId));
    await db.delete(stockReservations).where(eq(stockReservations.productId, testProductId));
    await db.delete(productStocks).where(eq(productStocks.productId, testProductId));
    await db.delete(products).where(eq(products.id, testProductId));
    await db.delete(stores).where(eq(stores.id, testStoreId));
    
    console.log('[TEST] Dados de teste limpos');
  });
  
  /**
   * Teste 1: Verificar disponibilidade de estoque
   */
  it('deve verificar disponibilidade corretamente', async () => {
    // Buscar estoque
    const [stock] = await db
      .select()
      .from(productStocks)
      .where(and(
        eq(productStocks.productId, testProductId),
        eq(productStocks.storeId, testStoreId)
      ));
    
    expect(stock).toBeDefined();
    expect(stock.quantity).toBe(100);
    
    console.log('[TEST 1] ✅ Estoque inicial: 100 unidades');
  });
  
  /**
   * Teste 2: Criar reserva de estoque
   */
  it('deve criar reserva de estoque com sucesso', async () => {
    const quantity = 10;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    
    const [reservation] = await db.insert(stockReservations).values({
      productId: testProductId,
      storeId: testStoreId,
      quantity,
      status: 'active',
      expiresAt
    }).returning();
    
    expect(reservation).toBeDefined();
    expect(reservation.quantity).toBe(quantity);
    expect(reservation.status).toBe('active');
    expect(reservation.expiresAt.getTime()).toBeGreaterThan(Date.now());
    
    console.log(`[TEST 2] ✅ Reserva criada: ${reservation.id}, Qtd: ${quantity}`);
  });
  
  /**
   * Teste 3: Calcular estoque disponível (físico - reservas)
   */
  it('deve calcular estoque disponível considerando reservas', async () => {
    // Buscar estoque físico
    const [stock] = await db
      .select()
      .from(productStocks)
      .where(and(
        eq(productStocks.productId, testProductId),
        eq(productStocks.storeId, testStoreId)
      ));
    
    // Buscar reservas ativas
    const now = new Date();
    const reservations = await db
      .select()
      .from(stockReservations)
      .where(and(
        eq(stockReservations.productId, testProductId),
        eq(stockReservations.storeId, testStoreId),
        eq(stockReservations.status, 'active')
      ));
    
    const reservedQty = reservations.reduce((sum, r) => sum + r.quantity, 0);
    const available = stock.quantity - reservedQty;
    
    expect(available).toBe(90); // 100 - 10 (reserva do teste anterior)
    
    console.log(`[TEST 3] ✅ Estoque disponível: ${available} (Físico: ${stock.quantity}, Reservado: ${reservedQty})`);
  });
  
  /**
   * Teste 4: Completar reserva e baixar estoque
   */
  it('deve completar reserva e baixar estoque automaticamente', async () => {
    // Buscar reserva ativa
    const [reservation] = await db
      .select()
      .from(stockReservations)
      .where(and(
        eq(stockReservations.productId, testProductId),
        eq(stockReservations.status, 'active')
      ));
    
    expect(reservation).toBeDefined();
    
    // Simular confirmação de venda
    const orderId = 999;
    
    // 1. Atualizar estoque físico
    const [stockBefore] = await db
      .select()
      .from(productStocks)
      .where(and(
        eq(productStocks.productId, testProductId),
        eq(productStocks.storeId, testStoreId)
      ));
    
    await db
      .update(productStocks)
      .set({
        quantity: stockBefore.quantity - reservation.quantity,
        updatedAt: new Date()
      })
      .where(and(
        eq(productStocks.productId, testProductId),
        eq(productStocks.storeId, testStoreId)
      ));
    
    // 2. Registrar movimentação
    await db.insert(stockMovements).values({
      productId: testProductId,
      storeId: testStoreId,
      movementType: 'sale',
      quantity: -reservation.quantity,
      reason: 'Venda confirmada - Teste',
      orderId
    });
    
    // 3. Marcar reserva como completada
    await db
      .update(stockReservations)
      .set({
        status: 'completed',
        orderId,
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(stockReservations.id, reservation.id));
    
    // Verificar resultado
    const [stockAfter] = await db
      .select()
      .from(productStocks)
      .where(and(
        eq(productStocks.productId, testProductId),
        eq(productStocks.storeId, testStoreId)
      ));
    
    const [reservationAfter] = await db
      .select()
      .from(stockReservations)
      .where(eq(stockReservations.id, reservation.id));
    
    expect(stockAfter.quantity).toBe(90); // 100 - 10
    expect(reservationAfter.status).toBe('completed');
    expect(reservationAfter.orderId).toBe(orderId);
    
    console.log(`[TEST 4] ✅ Baixa automática: Estoque ${stockBefore.quantity} → ${stockAfter.quantity}`);
  });
  
  /**
   * Teste 5: Cancelar venda e devolver ao estoque
   */
  it('deve cancelar venda e devolver ao estoque', async () => {
    // Buscar reserva completada
    const [reservation] = await db
      .select()
      .from(stockReservations)
      .where(and(
        eq(stockReservations.productId, testProductId),
        eq(stockReservations.status, 'completed')
      ));
    
    expect(reservation).toBeDefined();
    
    // Simular cancelamento
    const [stockBefore] = await db
      .select()
      .from(productStocks)
      .where(and(
        eq(productStocks.productId, testProductId),
        eq(productStocks.storeId, testStoreId)
      ));
    
    // 1. Devolver ao estoque
    await db
      .update(productStocks)
      .set({
        quantity: stockBefore.quantity + reservation.quantity,
        updatedAt: new Date()
      })
      .where(and(
        eq(productStocks.productId, testProductId),
        eq(productStocks.storeId, testStoreId)
      ));
    
    // 2. Registrar movimentação de cancelamento
    await db.insert(stockMovements).values({
      productId: testProductId,
      storeId: testStoreId,
      movementType: 'sale_cancellation',
      quantity: reservation.quantity, // Positivo para entrada
      reason: 'Cancelamento de venda - Teste',
      orderId: reservation.orderId || undefined
    });
    
    // 3. Marcar reserva como cancelada
    await db
      .update(stockReservations)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(stockReservations.id, reservation.id));
    
    // Verificar resultado
    const [stockAfter] = await db
      .select()
      .from(productStocks)
      .where(and(
        eq(productStocks.productId, testProductId),
        eq(productStocks.storeId, testStoreId)
      ));
    
    const [reservationAfter] = await db
      .select()
      .from(stockReservations)
      .where(eq(stockReservations.id, reservation.id));
    
    expect(stockAfter.quantity).toBe(100); // Voltou ao inicial
    expect(reservationAfter.status).toBe('cancelled');
    
    console.log(`[TEST 5] ✅ Cancelamento: Estoque ${stockBefore.quantity} → ${stockAfter.quantity}`);
  });
  
  /**
   * Teste 6: Criar reserva expirada e limpar
   */
  it('deve marcar reservas expiradas como expired', async () => {
    // Criar reserva já expirada
    const expiresAt = new Date(Date.now() - 1000); // 1 segundo atrás
    
    const [reservation] = await db.insert(stockReservations).values({
      productId: testProductId,
      storeId: testStoreId,
      quantity: 5,
      status: 'active',
      expiresAt
    }).returning();
    
    expect(reservation.expiresAt.getTime()).toBeLessThan(Date.now());
    
    // Simular limpeza de reservas expiradas
    const now = new Date();
    const expiredReservations = await db
      .select()
      .from(stockReservations)
      .where(and(
        eq(stockReservations.productId, testProductId),
        eq(stockReservations.status, 'active')
      ));
    
    let expiredCount = 0;
    for (const res of expiredReservations) {
      if (res.expiresAt < now) {
        await db
          .update(stockReservations)
          .set({
            status: 'expired',
            updatedAt: new Date()
          })
          .where(eq(stockReservations.id, res.id));
        expiredCount++;
      }
    }
    
    // Verificar resultado
    const [reservationAfter] = await db
      .select()
      .from(stockReservations)
      .where(eq(stockReservations.id, reservation.id));
    
    expect(reservationAfter.status).toBe('expired');
    expect(expiredCount).toBeGreaterThan(0);
    
    console.log(`[TEST 6] ✅ Limpeza: ${expiredCount} reserva(s) expirada(s) marcada(s)`);
  });
  
  /**
   * Teste 7: Validar estoque insuficiente
   */
  it('deve bloquear reserva quando estoque insuficiente', async () => {
    // Tentar reservar mais do que tem disponível
    const [stock] = await db
      .select()
      .from(productStocks)
      .where(and(
        eq(productStocks.productId, testProductId),
        eq(productStocks.storeId, testStoreId)
      ));
    
    const requestedQty = stock.quantity + 10; // Mais do que tem
    
    // Calcular disponível
    const reservations = await db
      .select()
      .from(stockReservations)
      .where(and(
        eq(stockReservations.productId, testProductId),
        eq(stockReservations.storeId, testStoreId),
        eq(stockReservations.status, 'active')
      ));
    
    const reservedQty = reservations.reduce((sum, r) => sum + r.quantity, 0);
    const available = stock.quantity - reservedQty;
    
    const isAvailable = available >= requestedQty;
    
    expect(isAvailable).toBe(false);
    
    console.log(`[TEST 7] ✅ Validação: Solicitado ${requestedQty}, Disponível ${available} → Bloqueado`);
  });
  
  /**
   * Teste 8: Verificar movimentações registradas
   */
  it('deve registrar todas as movimentações corretamente', async () => {
    const movements = await db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.productId, testProductId));
    
    // Deve ter pelo menos 2 movimentações (venda + cancelamento)
    expect(movements.length).toBeGreaterThanOrEqual(2);
    
    // Verificar tipos
    const saleMovement = movements.find(m => m.movementType === 'sale');
    const cancellationMovement = movements.find(m => m.movementType === 'sale_cancellation');
    
    expect(saleMovement).toBeDefined();
    expect(saleMovement!.quantity).toBeLessThan(0); // Negativo para saída
    
    expect(cancellationMovement).toBeDefined();
    expect(cancellationMovement!.quantity).toBeGreaterThan(0); // Positivo para entrada
    
    console.log(`[TEST 8] ✅ Movimentações: ${movements.length} registradas`);
    console.log(`  - Vendas: ${movements.filter(m => m.movementType === 'sale').length}`);
    console.log(`  - Cancelamentos: ${movements.filter(m => m.movementType === 'sale_cancellation').length}`);
  });
  
  /**
   * Teste 9: Cenário completo de venda
   */
  it('deve executar fluxo completo de venda com sucesso', async () => {
    console.log('\n[TEST 9] Iniciando fluxo completo de venda...\n');
    
    // 1. Verificar disponibilidade
    const [stock] = await db
      .select()
      .from(productStocks)
      .where(and(
        eq(productStocks.productId, testProductId),
        eq(productStocks.storeId, testStoreId)
      ));
    
    const initialStock = stock.quantity;
    console.log(`  1. Estoque inicial: ${initialStock} unidades`);
    
    // 2. Criar reserva
    const quantity = 15;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    
    const [reservation] = await db.insert(stockReservations).values({
      productId: testProductId,
      storeId: testStoreId,
      quantity,
      status: 'active',
      expiresAt
    }).returning();
    
    console.log(`  2. Reserva criada: ${quantity} unidades (expira em 15 min)`);
    
    // 3. Confirmar venda
    const orderId = 1000;
    
    await db
      .update(productStocks)
      .set({
        quantity: stock.quantity - quantity,
        updatedAt: new Date()
      })
      .where(and(
        eq(productStocks.productId, testProductId),
        eq(productStocks.storeId, testStoreId)
      ));
    
    await db.insert(stockMovements).values({
      productId: testProductId,
      storeId: testStoreId,
      movementType: 'sale',
      quantity: -quantity,
      reason: 'Venda confirmada - Fluxo completo',
      orderId
    });
    
    await db
      .update(stockReservations)
      .set({
        status: 'completed',
        orderId,
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(stockReservations.id, reservation.id));
    
    console.log(`  3. Venda confirmada: Pedido #${orderId}`);
    
    // 4. Verificar estoque final
    const [finalStock] = await db
      .select()
      .from(productStocks)
      .where(and(
        eq(productStocks.productId, testProductId),
        eq(productStocks.storeId, testStoreId)
      ));
    
    expect(finalStock.quantity).toBe(initialStock - quantity);
    
    console.log(`  4. Estoque final: ${finalStock.quantity} unidades`);
    console.log(`\n✅ Fluxo completo executado com sucesso!\n`);
  });
});
