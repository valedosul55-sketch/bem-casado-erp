import { db } from "./db";
import { productStocks, stockMovements, products, stores } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { sendLowStockAlert } from "./email";

interface UpdateStockParams {
  productId: number;
  storeId: number;
  quantity: number; // Positivo para entrada, negativo para saída
  reason: string;
  orderId?: number;
  userId?: number;
  notes?: string;
}

export async function updateStock({
  productId,
  storeId,
  quantity,
  reason,
  orderId,
  userId,
  notes,
}: UpdateStockParams) {
  return await db.transaction(async (tx) => {
    // 1. Registrar movimentação
    await tx.insert(stockMovements).values({
      productId,
      storeId,
      movementType: quantity > 0 ? "entry" : "exit",
      quantity: Math.abs(quantity), // Quantidade absoluta na movimentação
      reason,
      orderId,
      userId,
      notes,
    });

    // 2. Atualizar ou criar registro de estoque na loja
    const existingStock = await tx
      .select()
      .from(productStocks)
      .where(and(eq(productStocks.productId, productId), eq(productStocks.storeId, storeId)))
      .limit(1);

    if (existingStock.length > 0) {
      // Atualizar existente
      await tx
        .update(productStocks)
        .set({
          quantity: sql`${productStocks.quantity} + ${quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(productStocks.id, existingStock[0].id));
    } else {
      // Criar novo registro (apenas se for entrada ou se permitir estoque negativo)
      // Aqui vamos permitir criar com negativo se for venda, mas idealmente deveria ter validação antes
      await tx.insert(productStocks).values({
        productId,
        storeId,
        quantity: quantity,
      });
    }

    // 3. Atualizar estoque global (legado/compatibilidade)
    // Opcional: manter o campo 'stock' na tabela products sincronizado com a soma de todas as lojas
    // ou apenas com a loja principal. Por enquanto, vamos atualizar o global também.
    await tx
      .update(products)
      .set({
        stock: sql`${products.stock} + ${quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));
  });

  // 4. Verificar estoque baixo e notificar (fora da transação para não bloquear)
  try {
    // Buscar dados atualizados
    const stockData = await db
      .select({
        quantity: productStocks.quantity,
        minStock: productStocks.minStock,
        productName: products.name,
        storeName: stores.name,
      })
      .from(productStocks)
      .innerJoin(products, eq(productStocks.productId, products.id))
      .innerJoin(stores, eq(productStocks.storeId, stores.id))
      .where(and(eq(productStocks.productId, productId), eq(productStocks.storeId, storeId)))
      .limit(1);

    if (stockData.length > 0) {
      const { quantity, minStock, productName, storeName } = stockData[0];
      
      // Se estoque atual for menor ou igual ao mínimo e for uma saída (quantity < 0)
      // (Evita notificar quando está repondo estoque)
      if (minStock && minStock > 0 && quantity <= minStock && quantity < 0) {
        // 1. Notificação no sistema (Admin)
        await notifyOwner({
          title: `⚠️ Alerta de Estoque Baixo: ${storeName}`,
          content: `O produto "${productName}" atingiu o nível crítico de estoque na loja ${storeName}.\n\nEstoque Atual: ${quantity}\nEstoque Mínimo: ${minStock}\n\nPor favor, providencie a reposição.`,
        });

        // 2. Notificação por Email (Gerente da Loja)
        const storeInfo = await db
          .select({ notificationEmail: stores.notificationEmail })
          .from(stores)
          .where(eq(stores.id, storeId))
          .limit(1);

        if (storeInfo.length > 0 && storeInfo[0].notificationEmail) {
          await sendLowStockAlert({
            to: storeInfo[0].notificationEmail,
            storeName: storeName || "",
            productName: productName || "",
            currentStock: quantity,
            minStock: minStock || 0,
            unit: "un", // TODO: Buscar unidade correta do produto se necessário
          });
        }
      }
    }
  } catch (error) {
    console.error("[Stock] Erro ao verificar alerta de estoque baixo:", error);
  }
}

export async function getStockByStore(storeId: number) {
  return await db
    .select({
      productId: productStocks.productId,
      productName: products.name,
      quantity: productStocks.quantity,
      minStock: productStocks.minStock,
      maxStock: productStocks.maxStock,
      location: productStocks.location,
    })
    .from(productStocks)
    .innerJoin(products, eq(productStocks.productId, products.id))
    .where(eq(productStocks.storeId, storeId));
}
