/**
 * Sistema de Custo Médio Ponderado
 * 
 * Implementa o cálculo de custo médio conforme legislação brasileira (RIR/2018)
 * Método permitido pela Receita Federal para avaliação de estoques
 */

import { db } from "./db";
import { products } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Calcula o novo custo médio ponderado após uma entrada de estoque
 * 
 * Fórmula: Novo Custo Médio = (Valor Total em Estoque + Valor da Nova Compra) / (Qtd em Estoque + Qtd Comprada)
 * 
 * @param productId - ID do produto
 * @param newQuantity - Quantidade da nova entrada
 * @param newUnitCost - Custo unitário da nova entrada (em centavos)
 * @returns Novo custo médio (em centavos)
 */
export async function calculateAverageCost(
  productId: number,
  newQuantity: number,
  newUnitCost: number
): Promise<number> {
  // Buscar dados atuais do produto
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    throw new Error(`Produto ${productId} não encontrado`);
  }

  const currentStock = product.stock || 0;
  const currentAverageCost = product.averageCost || 0;

  // Se não há estoque atual, o custo médio é o custo da nova entrada
  if (currentStock === 0) {
    return newUnitCost;
  }

  // Calcular valor total em estoque
  const currentTotalValue = currentStock * currentAverageCost;

  // Calcular valor da nova compra
  const newTotalValue = newQuantity * newUnitCost;

  // Calcular novo custo médio ponderado
  const newAverageCost = Math.round(
    (currentTotalValue + newTotalValue) / (currentStock + newQuantity)
  );

  return newAverageCost;
}

/**
 * Atualiza o custo médio do produto no banco de dados
 * 
 * @param productId - ID do produto
 * @param newAverageCost - Novo custo médio (em centavos)
 */
export async function updateAverageCost(
  productId: number,
  newAverageCost: number
): Promise<void> {
  await db
    .update(products)
    .set({ 
      averageCost: newAverageCost,
      updatedAt: new Date()
    })
    .where(eq(products.id, productId));
}

/**
 * Processa entrada de estoque e atualiza custo médio automaticamente
 * 
 * Esta função deve ser chamada SEMPRE que houver entrada de estoque
 * 
 * @param productId - ID do produto
 * @param quantity - Quantidade da entrada
 * @param unitCost - Custo unitário (em centavos)
 * @returns Novo custo médio calculado
 */
export async function processStockEntry(
  productId: number,
  quantity: number,
  unitCost: number
): Promise<number> {
  // Calcular novo custo médio
  const newAverageCost = await calculateAverageCost(productId, quantity, unitCost);

  // Atualizar no banco de dados
  await updateAverageCost(productId, newAverageCost);

  return newAverageCost;
}

/**
 * Calcula a margem de lucro de um produto
 * 
 * @param productId - ID do produto
 * @returns Objeto com margem em valor e percentual
 */
export async function calculateProfitMargin(productId: number): Promise<{
  marginValue: number; // Margem em centavos
  marginPercent: number; // Margem em percentual
}> {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    throw new Error(`Produto ${productId} não encontrado`);
  }

  const salePrice = product.price;
  const averageCost = product.averageCost || 0;

  const marginValue = salePrice - averageCost;
  const marginPercent = averageCost > 0 
    ? ((marginValue / averageCost) * 100) 
    : 0;

  return {
    marginValue,
    marginPercent: Math.round(marginPercent * 100) / 100 // 2 casas decimais
  };
}

/**
 * Calcula o valor total do estoque (custo médio * quantidade)
 * 
 * @param productId - ID do produto (opcional, se não informado calcula todos)
 * @returns Valor total em centavos
 */
export async function calculateStockValue(productId?: number): Promise<number> {
  if (productId) {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      throw new Error(`Produto ${productId} não encontrado`);
    }

    return (product.stock || 0) * (product.averageCost || 0);
  }

  // Calcular valor total de todos os produtos
  const allProducts = await db.select().from(products);
  
  return allProducts.reduce((total, product) => {
    return total + ((product.stock || 0) * (product.averageCost || 0));
  }, 0);
}
