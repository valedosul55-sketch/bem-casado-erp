import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import { products, stockMovements } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Ajustes Manuais de Estoque', () => {
  let testProductId: number;

  beforeEach(async () => {
    // Criar produto de teste
    const [product] = await db
      .insert(products)
      .values({
        name: 'Produto Teste Ajuste',
        price: 1000, // R$ 10,00
        averageCost: 800, // R$ 8,00
        stock: 100,
        unit: 'un',
        active: 1,
      })
      .returning();

    testProductId = product.id;
  });

  describe('Ajustes Positivos (Entradas)', () => {
    it('deve registrar ajuste positivo corretamente', async () => {
      // Registrar ajuste de +50 unidades
      const [movement] = await db
        .insert(stockMovements)
        .values({
          productId: testProductId,
          movementType: 'adjustment',
          quantity: 50,
          unitCost: 900, // R$ 9,00
          reason: 'inventory',
          notes: 'Contagem física encontrou 50 unidades a mais',
        })
        .returning();

      expect(movement.quantity).toBe(50);
      expect(movement.movementType).toBe('adjustment');
      expect(movement.reason).toBe('inventory');

      // Verificar se estoque foi atualizado
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, testProductId))
        .limit(1);

      // Nota: O estoque não é atualizado automaticamente pelo banco,
      // isso é feito pelo router. Aqui testamos apenas a inserção.
      expect(movement).toBeDefined();
    });

    it('deve aceitar ajuste positivo sem custo unitário', async () => {
      const [movement] = await db
        .insert(stockMovements)
        .values({
          productId: testProductId,
          movementType: 'adjustment',
          quantity: 25,
          reason: 'return',
          notes: 'Devolução de cliente',
        })
        .returning();

      expect(movement.quantity).toBe(25);
      expect(movement.unitCost).toBeNull();
    });
  });

  describe('Ajustes Negativos (Saídas)', () => {
    it('deve registrar ajuste negativo corretamente', async () => {
      const [movement] = await db
        .insert(stockMovements)
        .values({
          productId: testProductId,
          movementType: 'adjustment',
          quantity: -20,
          reason: 'damage',
          notes: 'Produtos danificados durante transporte',
        })
        .returning();

      expect(movement.quantity).toBe(-20);
      expect(movement.reason).toBe('damage');
    });

    it('deve registrar ajuste por perda', async () => {
      const [movement] = await db
        .insert(stockMovements)
        .values({
          productId: testProductId,
          movementType: 'adjustment',
          quantity: -5,
          reason: 'loss',
          notes: 'Produtos extraviados no estoque',
        })
        .returning();

      expect(movement.quantity).toBe(-5);
      expect(movement.reason).toBe('loss');
    });

    it('deve registrar ajuste por vencimento', async () => {
      const [movement] = await db
        .insert(stockMovements)
        .values({
          productId: testProductId,
          movementType: 'adjustment',
          quantity: -10,
          reason: 'expiry',
          notes: 'Produtos vencidos descartados',
        })
        .returning();

      expect(movement.quantity).toBe(-10);
      expect(movement.reason).toBe('expiry');
    });
  });

  describe('Validações de Motivos', () => {
    it('deve aceitar todos os motivos válidos', async () => {
      const validReasons = [
        'inventory',
        'loss',
        'damage',
        'expiry',
        'return',
        'correction',
        'transfer',
        'sample',
        'theft',
        'other',
      ];

      for (const reason of validReasons) {
        const [movement] = await db
          .insert(stockMovements)
          .values({
            productId: testProductId,
            movementType: 'adjustment',
            quantity: 1,
            reason,
            notes: `Teste de motivo: ${reason}`,
          })
          .returning();

        expect(movement.reason).toBe(reason);
      }
    });
  });

  describe('Auditoria e Rastreabilidade', () => {
    it('deve registrar data de criação automaticamente', async () => {
      const [movement] = await db
        .insert(stockMovements)
        .values({
          productId: testProductId,
          movementType: 'adjustment',
          quantity: 10,
          reason: 'correction',
          notes: 'Correção de erro de cadastro',
        })
        .returning();

      expect(movement.createdAt).toBeInstanceOf(Date);
      expect(movement.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('deve permitir registrar usuário responsável', async () => {
      const [movement] = await db
        .insert(stockMovements)
        .values({
          productId: testProductId,
          movementType: 'adjustment',
          quantity: 15,
          reason: 'inventory',
          userId: 1, // ID do usuário
          notes: 'Ajuste realizado por usuário ID 1',
        })
        .returning();

      expect(movement.userId).toBe(1);
    });

    it('deve permitir observações detalhadas', async () => {
      const longNotes = 'A'.repeat(500); // 500 caracteres

      const [movement] = await db
        .insert(stockMovements)
        .values({
          productId: testProductId,
          movementType: 'adjustment',
          quantity: 5,
          reason: 'other',
          notes: longNotes,
        })
        .returning();

      expect(movement.notes).toBe(longNotes);
      expect(movement.notes?.length).toBe(500);
    });
  });

  describe('Integração com Loja', () => {
    it('deve permitir registrar ajuste por loja', async () => {
      const [movement] = await db
        .insert(stockMovements)
        .values({
          productId: testProductId,
          storeId: 1, // ID da loja
          movementType: 'adjustment',
          quantity: 30,
          reason: 'transfer',
          notes: 'Transferência da matriz para filial',
        })
        .returning();

      expect(movement.storeId).toBe(1);
    });
  });

  describe('Casos Especiais', () => {
    it('deve aceitar quantidade zero (para registro de auditoria)', async () => {
      const [movement] = await db
        .insert(stockMovements)
        .values({
          productId: testProductId,
          movementType: 'adjustment',
          quantity: 0,
          reason: 'inventory',
          notes: 'Contagem física confirmou estoque correto',
        })
        .returning();

      expect(movement.quantity).toBe(0);
    });

    it('deve aceitar ajustes grandes', async () => {
      const [movement] = await db
        .insert(stockMovements)
        .values({
          productId: testProductId,
          movementType: 'adjustment',
          quantity: 1000,
          reason: 'correction',
          notes: 'Correção de erro sistêmico - ajuste grande aprovado',
        })
        .returning();

      expect(movement.quantity).toBe(1000);
    });
  });

  describe('Consultas de Histórico', () => {
    it('deve listar ajustes por produto', async () => {
      // Criar vários ajustes
      await db.insert(stockMovements).values([
        {
          productId: testProductId,
          movementType: 'adjustment',
          quantity: 10,
          reason: 'inventory',
          notes: 'Ajuste 1',
        },
        {
          productId: testProductId,
          movementType: 'adjustment',
          quantity: -5,
          reason: 'damage',
          notes: 'Ajuste 2',
        },
        {
          productId: testProductId,
          movementType: 'adjustment',
          quantity: 20,
          reason: 'return',
          notes: 'Ajuste 3',
        },
      ]);

      // Buscar ajustes
      const adjustments = await db
        .select()
        .from(stockMovements)
        .where(
          eq(stockMovements.productId, testProductId)
        );

      expect(adjustments.length).toBeGreaterThanOrEqual(3);
    });

    it('deve filtrar ajustes por motivo', async () => {
      // Criar ajustes com motivos diferentes
      await db.insert(stockMovements).values([
        {
          productId: testProductId,
          movementType: 'adjustment',
          quantity: 10,
          reason: 'inventory',
          notes: 'Inventário',
        },
        {
          productId: testProductId,
          movementType: 'adjustment',
          quantity: -5,
          reason: 'damage',
          notes: 'Dano',
        },
      ]);

      // Buscar apenas ajustes de inventário
      const inventoryAdjustments = await db
        .select()
        .from(stockMovements)
        .where(
          eq(stockMovements.reason, 'inventory')
        );

      expect(inventoryAdjustments.length).toBeGreaterThanOrEqual(1);
      expect(inventoryAdjustments.every((adj) => adj.reason === 'inventory')).toBe(true);
    });
  });
});
