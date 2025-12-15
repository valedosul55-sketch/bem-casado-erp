import { describe, it, expect, beforeEach } from "vitest";
import { processPOSSale, SaleItem } from "./pos";
import { getDb } from "./db";
import { products } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("PDV - Sistema de Ponto de Venda", () => {
  
  describe("processPOSSale", () => {
    
    it("deve processar venda com sucesso e reduzir estoque", async () => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Buscar produto de teste
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.ean13, "7896285902176")) // Açúcar Cristal
        .limit(1);

      expect(product).toBeDefined();
      const initialStock = product.stock;

      // Processar venda de 2 unidades
      const saleItems: SaleItem[] = [
        {
          productId: product.id,
          quantity: 2,
          unitPrice: product.price,
        },
      ];

      const result = await processPOSSale(saleItems);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Venda processada com sucesso");
      expect(result.saleId).toBeDefined();

      // Verificar se estoque foi reduzido
      const [updatedProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, product.id))
        .limit(1);

      expect(updatedProduct.stock).toBe(initialStock - 2);

      // Restaurar estoque original
      await db
        .update(products)
        .set({ stock: initialStock })
        .where(eq(products.id, product.id));
    });

    it("deve falhar quando produto não existe", async () => {
      const saleItems: SaleItem[] = [
        {
          productId: 99999, // ID inexistente
          quantity: 1,
          unitPrice: 1000,
        },
      ];

      const result = await processPOSSale(saleItems);

      expect(result.success).toBe(false);
      expect(result.message).toContain("não encontrado");
    });

    it("deve falhar quando estoque é insuficiente", async () => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Buscar produto com estoque baixo
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.ean13, "7896285902046")) // Arroz Integral (100 kits)
        .limit(1);

      expect(product).toBeDefined();

      // Tentar vender mais do que tem em estoque
      const saleItems: SaleItem[] = [
        {
          productId: product.id,
          quantity: product.stock + 10, // Mais que o disponível
          unitPrice: product.price,
        },
      ];

      const result = await processPOSSale(saleItems);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Estoque insuficiente");
    });

    it("deve processar venda com múltiplos produtos", async () => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Buscar dois produtos diferentes
      const [product1] = await db
        .select()
        .from(products)
        .where(eq(products.ean13, "7896285902176")) // Açúcar
        .limit(1);

      const [product2] = await db
        .select()
        .from(products)
        .where(eq(products.ean13, "7896285902046")) // Arroz Integral
        .limit(1);

      expect(product1).toBeDefined();
      expect(product2).toBeDefined();

      const initialStock1 = product1.stock;
      const initialStock2 = product2.stock;

      // Vender 1 unidade de cada
      const saleItems: SaleItem[] = [
        {
          productId: product1.id,
          quantity: 1,
          unitPrice: product1.price,
        },
        {
          productId: product2.id,
          quantity: 1,
          unitPrice: product2.price,
        },
      ];

      const result = await processPOSSale(saleItems);

      expect(result.success).toBe(true);

      // Verificar estoques
      const [updated1] = await db
        .select()
        .from(products)
        .where(eq(products.id, product1.id))
        .limit(1);

      const [updated2] = await db
        .select()
        .from(products)
        .where(eq(products.id, product2.id))
        .limit(1);

      expect(updated1.stock).toBe(initialStock1 - 1);
      expect(updated2.stock).toBe(initialStock2 - 1);

      // Restaurar estoques
      await db
        .update(products)
        .set({ stock: initialStock1 })
        .where(eq(products.id, product1.id));

      await db
        .update(products)
        .set({ stock: initialStock2 })
        .where(eq(products.id, product2.id));
    });

    it("deve validar todos os produtos antes de processar venda", async () => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const [validProduct] = await db
        .select()
        .from(products)
        .where(eq(products.ean13, "7896285902176"))
        .limit(1);

      // Tentar vender um produto válido e um inválido
      const saleItems: SaleItem[] = [
        {
          productId: validProduct.id,
          quantity: 1,
          unitPrice: validProduct.price,
        },
        {
          productId: 99999, // Produto inexistente
          quantity: 1,
          unitPrice: 1000,
        },
      ];

      const result = await processPOSSale(saleItems);

      expect(result.success).toBe(false);

      // Verificar que o estoque do produto válido NÃO foi alterado
      const [unchangedProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, validProduct.id))
        .limit(1);

      expect(unchangedProduct.stock).toBe(validProduct.stock);
    });
  });
});
