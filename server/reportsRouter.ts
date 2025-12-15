/**
 * Router de Relatórios de Estoque
 * 
 * Fornece endpoints para geração de relatórios gerenciais:
 * - Posição de estoque (por filial, produto, categoria)
 * - Movimentações (entradas, saídas, ajustes)
 * - Produtos com estoque baixo
 * - Custo médio ponderado
 * - Exportação em PDF e Excel
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { 
  products, 
  productStocks, 
  stockMovements, 
  stores,
  stockBatches 
} from "../drizzle/schema";
import { eq, and, gte, lte, sql, desc, asc, inArray } from "drizzle-orm";

/**
 * Router de relatórios de estoque
 */
export const reportsRouter = router({
  /**
   * Relatório de Posição de Estoque
   * 
   * Retorna a posição atual de estoque com filtros opcionais:
   * - Por filial
   * - Por produto
   * - Por categoria
   * - Apenas produtos com estoque baixo
   */
  stockPosition: protectedProcedure
    .input(
      z.object({
        storeId: z.number().optional(),
        productId: z.number().optional(),
        category: z.string().optional(),
        onlyLowStock: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const { storeId, productId, category, onlyLowStock } = input;

      // Query base
      let query = db
        .select({
          productId: products.id,
          productName: products.name,
          productBrand: products.brand,
          productCategory: products.category,
          productEan13: products.ean13,
          productPrice: products.price,
          productAverageCost: products.averageCost,
          storeId: stores.id,
          storeName: stores.name,
          storeCity: stores.city,
          storeState: stores.state,
          quantity: productStocks.quantity,
          minStock: productStocks.minStock,
          maxStock: productStocks.maxStock,
          location: productStocks.location,
          updatedAt: productStocks.updatedAt,
        })
        .from(productStocks)
        .innerJoin(products, eq(productStocks.productId, products.id))
        .innerJoin(stores, eq(productStocks.storeId, stores.id));

      // Aplicar filtros
      const conditions = [eq(products.active, 1)];

      if (storeId) {
        conditions.push(eq(productStocks.storeId, storeId));
      }

      if (productId) {
        conditions.push(eq(products.id, productId));
      }

      if (category) {
        conditions.push(eq(products.category, category));
      }

      if (conditions.length > 1) {
        query = query.where(and(...conditions));
      }

      let results = await query;

      // Filtrar apenas produtos com estoque baixo (se solicitado)
      if (onlyLowStock) {
        results = results.filter(
          (item) => item.quantity <= (item.minStock || 0)
        );
      }

      // Calcular estatísticas
      const totalItems = results.length;
      const totalQuantity = results.reduce((sum, item) => sum + item.quantity, 0);
      const totalValue = results.reduce(
        (sum, item) => sum + item.quantity * item.productPrice,
        0
      );
      const totalCost = results.reduce(
        (sum, item) => sum + item.quantity * item.productAverageCost,
        0
      );
      const lowStockCount = results.filter(
        (item) => item.quantity <= (item.minStock || 0)
      ).length;

      return {
        items: results,
        stats: {
          totalItems,
          totalQuantity,
          totalValue,
          totalCost,
          lowStockCount,
          averageMargin:
            totalValue > 0 ? ((totalValue - totalCost) / totalValue) * 100 : 0,
        },
      };
    }),

  /**
   * Relatório de Movimentações de Estoque
   * 
   * Retorna histórico de movimentações com filtros:
   * - Por período (data inicial e final)
   * - Por filial
   * - Por produto
   * - Por tipo de movimentação
   */
  stockMovements: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(), // ISO string
        endDate: z.string().optional(), // ISO string
        storeId: z.number().optional(),
        productId: z.number().optional(),
        movementType: z
          .enum(["entry", "exit", "adjustment", "sale", "sale_cancellation"])
          .optional(),
        limit: z.number().min(1).max(1000).default(100),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const {
        startDate,
        endDate,
        storeId,
        productId,
        movementType,
        limit,
        offset,
      } = input;

      // Query base
      const conditions = [];

      if (startDate) {
        conditions.push(gte(stockMovements.createdAt, new Date(startDate)));
      }

      if (endDate) {
        conditions.push(lte(stockMovements.createdAt, new Date(endDate)));
      }

      if (storeId) {
        conditions.push(eq(stockMovements.storeId, storeId));
      }

      if (productId) {
        conditions.push(eq(stockMovements.productId, productId));
      }

      if (movementType) {
        conditions.push(eq(stockMovements.movementType, movementType));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Buscar movimentações
      const movements = await db
        .select({
          id: stockMovements.id,
          productId: stockMovements.productId,
          productName: products.name,
          productBrand: products.brand,
          storeId: stockMovements.storeId,
          storeName: stores.name,
          movementType: stockMovements.movementType,
          quantity: stockMovements.quantity,
          unitCost: stockMovements.unitCost,
          reason: stockMovements.reason,
          orderId: stockMovements.orderId,
          userId: stockMovements.userId,
          notes: stockMovements.notes,
          createdAt: stockMovements.createdAt,
        })
        .from(stockMovements)
        .innerJoin(products, eq(stockMovements.productId, products.id))
        .leftJoin(stores, eq(stockMovements.storeId, stores.id))
        .where(whereClause)
        .orderBy(desc(stockMovements.createdAt))
        .limit(limit)
        .offset(offset);

      // Contar total de registros
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(stockMovements)
        .where(whereClause);

      const total = Number(countResult[0]?.count || 0);

      // Calcular estatísticas
      const entries = movements.filter((m) => m.movementType === "entry");
      const exits = movements.filter(
        (m) => m.movementType === "exit" || m.movementType === "sale"
      );
      const adjustments = movements.filter((m) => m.movementType === "adjustment");

      const totalEntries = entries.reduce((sum, m) => sum + m.quantity, 0);
      const totalExits = exits.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
      const totalAdjustments = adjustments.reduce((sum, m) => sum + m.quantity, 0);

      return {
        movements,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        stats: {
          totalEntries,
          totalExits,
          totalAdjustments,
          netChange: totalEntries - totalExits + totalAdjustments,
        },
      };
    }),

  /**
   * Relatório de Produtos com Estoque Baixo
   * 
   * Retorna produtos que estão abaixo do estoque mínimo
   */
  lowStockProducts: protectedProcedure
    .input(
      z.object({
        storeId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { storeId } = input;

      const conditions = [eq(products.active, 1)];

      if (storeId) {
        conditions.push(eq(productStocks.storeId, storeId));
      }

      const results = await db
        .select({
          productId: products.id,
          productName: products.name,
          productBrand: products.brand,
          productCategory: products.category,
          storeId: stores.id,
          storeName: stores.name,
          quantity: productStocks.quantity,
          minStock: productStocks.minStock,
          deficit: sql<number>`${productStocks.minStock} - ${productStocks.quantity}`,
          location: productStocks.location,
        })
        .from(productStocks)
        .innerJoin(products, eq(productStocks.productId, products.id))
        .innerJoin(stores, eq(productStocks.storeId, stores.id))
        .where(and(...conditions))
        .orderBy(
          desc(sql`${productStocks.minStock} - ${productStocks.quantity}`)
        );

      // Filtrar apenas produtos com estoque baixo
      const lowStockItems = results.filter(
        (item) => item.quantity <= (item.minStock || 0)
      );

      return {
        items: lowStockItems,
        stats: {
          totalProducts: lowStockItems.length,
          totalDeficit: lowStockItems.reduce(
            (sum, item) => sum + (item.deficit || 0),
            0
          ),
        },
      };
    }),

  /**
   * Relatório de Custo Médio Ponderado
   * 
   * Retorna produtos com informações de custo médio e margem
   */
  averageCostReport: protectedProcedure
    .input(
      z.object({
        storeId: z.number().optional(),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { storeId, category } = input;

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
          storeId: stores.id,
          storeName: stores.name,
          quantity: productStocks.quantity,
          averageCost: products.averageCost,
          price: products.price,
          totalCost: sql<number>`${productStocks.quantity} * ${products.averageCost}`,
          totalValue: sql<number>`${productStocks.quantity} * ${products.price}`,
          margin: sql<number>`CASE 
            WHEN ${products.price} > 0 
            THEN ((${products.price} - ${products.averageCost}) * 100.0 / ${products.price})
            ELSE 0 
          END`,
        })
        .from(productStocks)
        .innerJoin(products, eq(productStocks.productId, products.id))
        .innerJoin(stores, eq(productStocks.storeId, stores.id))
        .where(and(...conditions))
        .orderBy(desc(sql`${productStocks.quantity} * ${products.averageCost}`));

      // Calcular estatísticas gerais
      const totalCost = results.reduce((sum, item) => sum + (item.totalCost || 0), 0);
      const totalValue = results.reduce((sum, item) => sum + (item.totalValue || 0), 0);
      const averageMargin = totalValue > 0 ? ((totalValue - totalCost) / totalValue) * 100 : 0;

      return {
        items: results,
        stats: {
          totalProducts: results.length,
          totalCost,
          totalValue,
          averageMargin,
          totalProfit: totalValue - totalCost,
        },
      };
    }),

  /**
   * Top Produtos Mais Movimentados
   * 
   * Retorna os produtos com maior volume de movimentações
   */
  topMovedProducts: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        storeId: z.number().optional(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const { startDate, endDate, storeId, limit } = input;

      const conditions = [];

      if (startDate) {
        conditions.push(gte(stockMovements.createdAt, new Date(startDate)));
      }

      if (endDate) {
        conditions.push(lte(stockMovements.createdAt, new Date(endDate)));
      }

      if (storeId) {
        conditions.push(eq(stockMovements.storeId, storeId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const results = await db
        .select({
          productId: products.id,
          productName: products.name,
          productBrand: products.brand,
          productCategory: products.category,
          totalMovements: sql<number>`count(*)`,
          totalQuantity: sql<number>`sum(abs(${stockMovements.quantity}))`,
          entries: sql<number>`sum(CASE WHEN ${stockMovements.movementType} = 'entry' THEN ${stockMovements.quantity} ELSE 0 END)`,
          exits: sql<number>`sum(CASE WHEN ${stockMovements.movementType} IN ('exit', 'sale') THEN abs(${stockMovements.quantity}) ELSE 0 END)`,
        })
        .from(stockMovements)
        .innerJoin(products, eq(stockMovements.productId, products.id))
        .where(whereClause)
        .groupBy(products.id, products.name, products.brand, products.category)
        .orderBy(desc(sql`sum(abs(${stockMovements.quantity}))`))
        .limit(limit);

      return {
        items: results,
      };
    }),

  /**
   * Evolução de Estoque (para gráficos)
   * 
   * Retorna dados agregados por dia para visualização em gráficos
   */
  stockEvolution: protectedProcedure
    .input(
      z.object({
        startDate: z.string(), // ISO string (obrigatório)
        endDate: z.string(), // ISO string (obrigatório)
        storeId: z.number().optional(),
        productId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { startDate, endDate, storeId, productId } = input;

      const conditions = [
        gte(stockMovements.createdAt, new Date(startDate)),
        lte(stockMovements.createdAt, new Date(endDate)),
      ];

      if (storeId) {
        conditions.push(eq(stockMovements.storeId, storeId));
      }

      if (productId) {
        conditions.push(eq(stockMovements.productId, productId));
      }

      const results = await db
        .select({
          date: sql<string>`DATE(${stockMovements.createdAt})`,
          entries: sql<number>`sum(CASE WHEN ${stockMovements.movementType} = 'entry' THEN ${stockMovements.quantity} ELSE 0 END)`,
          exits: sql<number>`sum(CASE WHEN ${stockMovements.movementType} IN ('exit', 'sale') THEN abs(${stockMovements.quantity}) ELSE 0 END)`,
          adjustments: sql<number>`sum(CASE WHEN ${stockMovements.movementType} = 'adjustment' THEN ${stockMovements.quantity} ELSE 0 END)`,
          netChange: sql<number>`sum(${stockMovements.quantity})`,
        })
        .from(stockMovements)
        .where(and(...conditions))
        .groupBy(sql`DATE(${stockMovements.createdAt})`)
        .orderBy(asc(sql`DATE(${stockMovements.createdAt})`));

      return {
        data: results,
      };
    }),

  /**
   * Listar todas as lojas (para filtros)
   */
  listStores: protectedProcedure.query(async () => {
    const storesList = await db
      .select({
        id: stores.id,
        name: stores.name,
        city: stores.city,
        state: stores.state,
        active: stores.active,
      })
      .from(stores)
      .where(eq(stores.active, 1))
      .orderBy(asc(stores.name));

    return storesList;
  }),

  /**
   * Listar todas as categorias (para filtros)
   */
  listCategories: protectedProcedure.query(async () => {
    const categories = await db
      .selectDistinct({
        category: products.category,
      })
      .from(products)
      .where(and(eq(products.active, 1), sql`${products.category} IS NOT NULL`))
      .orderBy(asc(products.category));

    return categories.map((c) => c.category).filter(Boolean);
  }),
});
