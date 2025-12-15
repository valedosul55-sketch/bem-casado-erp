import { getDb } from "./db";
import { products } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export interface SaleItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export async function processPOSSale(items: SaleItem[]): Promise<{ success: boolean; message: string; saleId?: number }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Verificar estoque de todos os produtos antes de processar
    for (const item of items) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (!product) {
        return {
          success: false,
          message: `Produto ID ${item.productId} não encontrado`
        };
      }

      if (product.stock < item.quantity) {
        return {
          success: false,
          message: `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}, Solicitado: ${item.quantity}`
        };
      }
    }

    // Processar baixa de estoque
    for (const item of items) {
      const [currentProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      await db
        .update(products)
        .set({
          stock: currentProduct.stock - item.quantity
        })
        .where(eq(products.id, item.productId));
    }

    // TODO: Registrar venda na tabela de vendas (quando implementarmos)
    
    return {
      success: true,
      message: "Venda processada com sucesso",
      saleId: Date.now() // Temporário até termos tabela de vendas
    };

  } catch (error) {
    console.error("[POS] Erro ao processar venda:", error);
    return {
      success: false,
      message: "Erro ao processar venda: " + (error instanceof Error ? error.message : String(error))
    };
  }
}
