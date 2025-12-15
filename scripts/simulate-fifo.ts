/**
 * Script de Simulação: Compra e Venda com FIFO
 * 
 * Demonstra o funcionamento completo do sistema de estoque:
 * 1. Criar produto (Arroz)
 * 2. Criar 3 lotes de compra (R$ 20, R$ 25, R$ 28)
 * 3. Efetuar venda de 15kg (FIFO automático)
 * 4. Mostrar rastreabilidade e cálculo de CMV
 */

import { db } from '../server/db';
import { products, productStocks, stockBatches, stockMovements } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

console.log('🎯 SIMULAÇÃO: Sistema de Estoque com FIFO\n');
console.log('='.repeat(60));

// Configurações
const STORE_ID = 1; // Loja principal
const PRODUCT_NAME = 'Arroz Branco Tipo 1';
const PRODUCT_EAN = '7891234567890';

async function main() {
  try {
    // ========================================
    // PASSO 1: Verificar/Criar Produto
    // ========================================
    console.log('\n📦 PASSO 1: Verificar Produto');
    console.log('-'.repeat(60));
    
    let product = await db
      .select()
      .from(products)
      .where(eq(products.ean13, PRODUCT_EAN))
      .limit(1)
      .then(rows => rows[0]);

    if (!product) {
      console.log('Criando produto: Arroz Branco Tipo 1...');
      const [newProduct] = await db
        .insert(products)
        .values({
          name: PRODUCT_NAME,
          ean13: PRODUCT_EAN,
          brand: 'Tio João',
          category: 'Alimentos',
          unit: 'kg',
          price: 4500, // R$ 45,00 (preço de venda)
          averageCost: 0,
          active: 1,
        })
        .returning();
      product = newProduct;
      console.log(`✅ Produto criado: ID ${product.id}`);
    } else {
      console.log(`✅ Produto encontrado: ID ${product.id} - ${product.name}`);
    }

    // ========================================
    // PASSO 2: COMPRA 1 - 10kg a R$ 20,00
    // ========================================
    console.log('\n💰 PASSO 2: COMPRA 1 - 10kg a R$ 20,00 (R$ 2,00/kg)');
    console.log('-'.repeat(60));
    
    const [lote1] = await db
      .insert(stockBatches)
      .values({
        productId: product.id,
        storeId: STORE_ID,
        batchNumber: 'LOTE-2024-001',
        quantity: 10,
        initialQuantity: 10,
        unitCost: 200, // R$ 2,00 em centavos
        entryDate: new Date().toISOString().split('T')[0],
        supplier: 'Fornecedor A',
        notes: 'Primeira compra - Simulação FIFO',
      })
      .returning();

    console.log(`✅ Lote 1 criado: ${lote1.batchNumber}`);
    console.log(`   Quantidade: ${lote1.quantity}kg`);
    console.log(`   Custo Unitário: R$ ${(lote1.unitCost / 100).toFixed(2)}/kg`);
    console.log(`   Custo Total: R$ ${(lote1.quantity * lote1.unitCost / 100).toFixed(2)}`);

    // Atualizar estoque
    await updateStock(product.id, STORE_ID, 10);

    // ========================================
    // PASSO 3: COMPRA 2 - 10kg a R$ 25,00
    // ========================================
    console.log('\n💰 PASSO 3: COMPRA 2 - 10kg a R$ 25,00 (R$ 2,50/kg)');
    console.log('-'.repeat(60));
    
    const [lote2] = await db
      .insert(stockBatches)
      .values({
        productId: product.id,
        storeId: STORE_ID,
        batchNumber: 'LOTE-2024-002',
        quantity: 10,
        initialQuantity: 10,
        unitCost: 250, // R$ 2,50 em centavos
        entryDate: new Date().toISOString().split('T')[0],
        supplier: 'Fornecedor B',
        notes: 'Segunda compra - Simulação FIFO',
      })
      .returning();

    console.log(`✅ Lote 2 criado: ${lote2.batchNumber}`);
    console.log(`   Quantidade: ${lote2.quantity}kg`);
    console.log(`   Custo Unitário: R$ ${(lote2.unitCost / 100).toFixed(2)}/kg`);
    console.log(`   Custo Total: R$ ${(lote2.quantity * lote2.unitCost / 100).toFixed(2)}`);

    await updateStock(product.id, STORE_ID, 10);

    // ========================================
    // PASSO 4: COMPRA 3 - 10kg a R$ 28,00
    // ========================================
    console.log('\n💰 PASSO 4: COMPRA 3 - 10kg a R$ 28,00 (R$ 2,80/kg)');
    console.log('-'.repeat(60));
    
    const [lote3] = await db
      .insert(stockBatches)
      .values({
        productId: product.id,
        storeId: STORE_ID,
        batchNumber: 'LOTE-2024-003',
        quantity: 10,
        initialQuantity: 10,
        unitCost: 280, // R$ 2,80 em centavos
        entryDate: new Date().toISOString().split('T')[0],
        supplier: 'Fornecedor C',
        notes: 'Terceira compra - Simulação FIFO',
      })
      .returning();

    console.log(`✅ Lote 3 criado: ${lote3.batchNumber}`);
    console.log(`   Quantidade: ${lote3.quantity}kg`);
    console.log(`   Custo Unitário: R$ ${(lote3.unitCost / 100).toFixed(2)}/kg`);
    console.log(`   Custo Total: R$ ${(lote3.quantity * lote3.unitCost / 100).toFixed(2)}`);

    await updateStock(product.id, STORE_ID, 10);

    // ========================================
    // RESUMO DO ESTOQUE ANTES DA VENDA
    // ========================================
    console.log('\n📊 RESUMO DO ESTOQUE (Antes da Venda)');
    console.log('='.repeat(60));
    
    const stockBefore = await db
      .select()
      .from(productStocks)
      .where(
        and(
          eq(productStocks.productId, product.id),
          eq(productStocks.storeId, STORE_ID)
        )
      )
      .limit(1)
      .then(rows => rows[0]);

    console.log(`Produto: ${product.name}`);
    console.log(`Estoque Total: ${stockBefore?.quantity || 0}kg`);
    console.log('\nLotes Disponíveis:');
    console.log(`  Lote 1: 10kg a R$ 2,00/kg = R$ 20,00`);
    console.log(`  Lote 2: 10kg a R$ 2,50/kg = R$ 25,00`);
    console.log(`  Lote 3: 10kg a R$ 2,80/kg = R$ 28,00`);
    console.log(`  TOTAL: 30kg = R$ 73,00`);

    // ========================================
    // PASSO 5: VENDA - 15kg a R$ 45,00
    // ========================================
    console.log('\n🛒 PASSO 5: VENDA - 15kg a R$ 45,00 (R$ 3,00/kg)');
    console.log('='.repeat(60));
    
    const quantidadeVenda = 15;
    const precoVenda = 4500; // R$ 45,00 em centavos

    console.log(`Quantidade: ${quantidadeVenda}kg`);
    console.log(`Preço Total: R$ ${(precoVenda / 100).toFixed(2)}`);
    console.log(`Preço/kg: R$ ${(precoVenda / quantidadeVenda / 100).toFixed(2)}`);

    // Buscar lotes disponíveis (FIFO - ordenar por data de entrada)
    const lotesDisponiveis = await db
      .select()
      .from(stockBatches)
      .where(
        and(
          eq(stockBatches.productId, product.id),
          eq(stockBatches.storeId, STORE_ID)
        )
      )
      .orderBy(stockBatches.entryDate); // FIFO: mais antigos primeiro

    console.log('\n🔄 Aplicando FIFO (First In, First Out):');
    console.log('-'.repeat(60));

    let quantidadeRestante = quantidadeVenda;
    let cmvTotal = 0;

    for (const lote of lotesDisponiveis) {
      if (quantidadeRestante <= 0) break;
      if (lote.quantity <= 0) continue;

      const quantidadeBaixar = Math.min(quantidadeRestante, lote.quantity);
      const custoLote = quantidadeBaixar * lote.unitCost / 100;

      console.log(`  ✓ ${lote.batchNumber}: ${quantidadeBaixar}kg x R$ ${(lote.unitCost / 100).toFixed(2)}/kg = R$ ${custoLote.toFixed(2)}`);

      // Atualizar quantidade do lote
      await db
        .update(stockBatches)
        .set({ quantity: lote.quantity - quantidadeBaixar })
        .where(eq(stockBatches.id, lote.id));

      // Registrar movimentação
      await db.insert(stockMovements).values({
        productId: product.id,
        storeId: STORE_ID,
        batchId: lote.id,
        movementType: 'sale',
        quantity: -quantidadeBaixar,
        unitCost: lote.unitCost,
        reason: 'Venda - Simulação FIFO',
        notes: `Baixa automática via FIFO - ${quantidadeBaixar}kg`,
      });

      cmvTotal += custoLote;
      quantidadeRestante -= quantidadeBaixar;
    }

    // Atualizar estoque
    await updateStock(product.id, STORE_ID, -quantidadeVenda);

    // ========================================
    // ANÁLISE FINANCEIRA
    // ========================================
    console.log('\n💵 ANÁLISE FINANCEIRA');
    console.log('='.repeat(60));
    
    const receitaTotal = precoVenda / 100;
    const lucro = receitaTotal - cmvTotal;
    const margemLucro = (lucro / receitaTotal) * 100;

    console.log(`Receita Total:     R$ ${receitaTotal.toFixed(2)}`);
    console.log(`CMV (Custo):       R$ ${cmvTotal.toFixed(2)}`);
    console.log(`Lucro Bruto:       R$ ${lucro.toFixed(2)}`);
    console.log(`Margem de Lucro:   ${margemLucro.toFixed(2)}%`);

    // ========================================
    // ESTOQUE FINAL
    // ========================================
    console.log('\n📊 ESTOQUE FINAL (Após a Venda)');
    console.log('='.repeat(60));
    
    const stockAfter = await db
      .select()
      .from(productStocks)
      .where(
        and(
          eq(productStocks.productId, product.id),
          eq(productStocks.storeId, STORE_ID)
        )
      )
      .limit(1)
      .then(rows => rows[0]);

    const lotesFinais = await db
      .select()
      .from(stockBatches)
      .where(
        and(
          eq(stockBatches.productId, product.id),
          eq(stockBatches.storeId, STORE_ID)
        )
      )
      .orderBy(stockBatches.entryDate);

    console.log(`Estoque Total: ${stockAfter?.quantity || 0}kg\n`);
    console.log('Lotes Remanescentes:');
    
    let valorEstoqueTotal = 0;
    for (const lote of lotesFinais) {
      if (lote.quantity > 0) {
        const valorLote = lote.quantity * lote.unitCost / 100;
        valorEstoqueTotal += valorLote;
        console.log(`  ${lote.batchNumber}: ${lote.quantity}kg a R$ ${(lote.unitCost / 100).toFixed(2)}/kg = R$ ${valorLote.toFixed(2)}`);
      } else {
        console.log(`  ${lote.batchNumber}: ESGOTADO`);
      }
    }
    
    console.log(`\nValor Total do Estoque: R$ ${valorEstoqueTotal.toFixed(2)}`);

    // ========================================
    // RESUMO FINAL
    // ========================================
    console.log('\n✅ RESUMO DA SIMULAÇÃO');
    console.log('='.repeat(60));
    console.log('Compras:');
    console.log('  Lote 1: 10kg x R$ 2,00/kg = R$ 20,00');
    console.log('  Lote 2: 10kg x R$ 2,50/kg = R$ 25,00');
    console.log('  Lote 3: 10kg x R$ 2,80/kg = R$ 28,00');
    console.log('  TOTAL COMPRADO: 30kg = R$ 73,00\n');
    
    console.log('Venda (FIFO):');
    console.log(`  15kg a R$ 3,00/kg = R$ ${receitaTotal.toFixed(2)}`);
    console.log(`  CMV: R$ ${cmvTotal.toFixed(2)}`);
    console.log(`  Lucro: R$ ${lucro.toFixed(2)} (${margemLucro.toFixed(2)}%)\n`);
    
    console.log('Estoque Final:');
    console.log(`  Lote 2: 5kg x R$ 2,50/kg = R$ 12,50`);
    console.log(`  Lote 3: 10kg x R$ 2,80/kg = R$ 28,00`);
    console.log(`  TOTAL RESTANTE: 15kg = R$ ${valorEstoqueTotal.toFixed(2)}`);

    console.log('\n🎉 Simulação concluída com sucesso!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Erro na simulação:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

/**
 * Atualiza o estoque do produto
 */
async function updateStock(productId: number, storeId: number, quantityChange: number) {
  const stock = await db
    .select()
    .from(productStocks)
    .where(
      and(
        eq(productStocks.productId, productId),
        eq(productStocks.storeId, storeId)
      )
    )
    .limit(1)
    .then(rows => rows[0]);

  if (stock) {
    await db
      .update(productStocks)
      .set({
        quantity: stock.quantity + quantityChange,
        updatedAt: new Date(),
      })
      .where(eq(productStocks.id, stock.id));
  } else {
    await db.insert(productStocks).values({
      productId,
      storeId,
      quantity: quantityChange,
      minStock: 5,
      maxStock: 100,
    });
  }
}

main();
