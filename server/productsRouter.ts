/**
 * Router de Cadastro Completo de Produtos
 * 
 * Gerencia produtos com todas as informações:
 * - Básicas (nome, descrição, categoria)
 * - Fiscais (NCM, CEST, CFOP, CST, alíquotas)
 * - Comerciais (preços, margem, comissão)
 * - Estoque (mínimo, máximo, lote, validade)
 * - Fornecedores
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { 
  products, 
  productTaxInfo, 
  productCommercialInfo, 
  productStockInfo,
  productSuppliers,
  suppliers
} from "../drizzle/schema";
import { eq, like, and, or, desc, asc, sql } from "drizzle-orm";

export const productsRouter = router({
  /**
   * Listar produtos com paginação e filtros
   */
  list: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(20),
      search: z.string().optional(),
      category: z.string().optional(),
      active: z.boolean().optional(),
      sortBy: z.enum(["name", "price", "stock", "createdAt"]).default("name"),
      sortOrder: z.enum(["asc", "desc"]).default("asc"),
    }))
    .query(async ({ input }) => {
      const { page, pageSize, search, category, active, sortBy, sortOrder } = input;
      const offset = (page - 1) * pageSize;

      // Construir filtros
      const filters: any[] = [];
      if (search) {
        filters.push(
          or(
            like(products.name, `%${search}%`),
            like(products.brand, `%${search}%`),
            like(products.ean13, `%${search}%`)
          )
        );
      }
      if (category) {
        filters.push(eq(products.category, category));
      }
      if (active !== undefined) {
        filters.push(eq(products.active, active ? 1 : 0));
      }

      // Buscar produtos
      const productsList = await db
        .select()
        .from(products)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(sortOrder === "asc" ? asc(products[sortBy]) : desc(products[sortBy]))
        .limit(pageSize)
        .offset(offset);

      // Contar total
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(filters.length > 0 ? and(...filters) : undefined);

      return {
        products: productsList,
        total: Number(count),
        page,
        pageSize,
        totalPages: Math.ceil(Number(count) / pageSize),
      };
    }),

  /**
   * Buscar produto completo por ID (com todas as informações)
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      // Buscar produto básico
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id));

      if (!product) {
        throw new Error("Produto não encontrado");
      }

      // Buscar informações fiscais
      const [taxInfo] = await db
        .select()
        .from(productTaxInfo)
        .where(eq(productTaxInfo.productId, input.id));

      // Buscar informações comerciais
      const [commercialInfo] = await db
        .select()
        .from(productCommercialInfo)
        .where(eq(productCommercialInfo.productId, input.id));

      // Buscar informações de estoque
      const [stockInfo] = await db
        .select()
        .from(productStockInfo)
        .where(eq(productStockInfo.productId, input.id));

      // Buscar fornecedores
      const productSuppliersList = await db
        .select({
          id: productSuppliers.id,
          supplierId: productSuppliers.supplierId,
          supplierName: suppliers.name,
          codigoFornecedor: productSuppliers.codigoFornecedor,
          precoCusto: productSuppliers.precoCusto,
          prazoEntrega: productSuppliers.prazoEntrega,
          loteMinimoCompra: productSuppliers.loteMinimoCompra,
          isPrincipal: productSuppliers.isPrincipal,
          prioridade: productSuppliers.prioridade,
          active: productSuppliers.active,
        })
        .from(productSuppliers)
        .leftJoin(suppliers, eq(productSuppliers.supplierId, suppliers.id))
        .where(eq(productSuppliers.productId, input.id));

      return {
        ...product,
        taxInfo,
        commercialInfo,
        stockInfo,
        suppliers: productSuppliersList,
      };
    }),

  /**
   * Criar produto completo
   */
  create: protectedProcedure
    .input(z.object({
      // Informações básicas
      name: z.string().min(1),
      brand: z.string().optional(),
      description: z.string().optional(),
      price: z.number().int(),
      unit: z.string().default("un"),
      imageUrl: z.string().optional(),
      category: z.string().optional(),
      ean13: z.string().optional(),
      
      // Informações fiscais
      taxInfo: z.object({
        ncm: z.string().length(8),
        cest: z.string().optional(),
        origem: z.string().length(1).default("0"),
        cfopVendaDentroEstado: z.string().default("5102"),
        cfopVendaForaEstado: z.string().default("6102"),
        cstIcms: z.string().optional(),
        aliquotaIcms: z.number().default(0),
        cstPis: z.string().optional(),
        aliquotaPis: z.number().default(165),
        cstCofins: z.string().optional(),
        aliquotaCofins: z.number().default(760),
      }).optional(),
      
      // Informações comerciais
      commercialInfo: z.object({
        precoCusto: z.number().int().default(0),
        precoVenda: z.number().int().default(0),
        margemLucro: z.number().default(0),
        descontoMaximo: z.number().default(0),
        comissaoVenda: z.number().default(0),
      }).optional(),
      
      // Informações de estoque
      stockInfo: z.object({
        estoqueMinimo: z.number().default(0),
        estoqueMaximo: z.number().optional(),
        controlaLote: z.boolean().default(true),
        controlaValidade: z.boolean().default(true),
        prazoValidadePadrao: z.number().optional(),
        tipoProduto: z.enum(["acabado", "materia_prima", "insumo", "embalagem"]).default("acabado"),
      }).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { taxInfo, commercialInfo, stockInfo, ...productData } = input;

      // Criar produto
      const [newProduct] = await db
        .insert(products)
        .values({
          ...productData,
          ncm: taxInfo?.ncm,
          cest: taxInfo?.cest,
          averageCost: commercialInfo?.precoCusto || 0,
        })
        .returning();

      // Criar informações fiscais
      if (taxInfo) {
        await db.insert(productTaxInfo).values({
          productId: newProduct.id,
          ...taxInfo,
        });
      }

      // Criar informações comerciais
      if (commercialInfo) {
        await db.insert(productCommercialInfo).values({
          productId: newProduct.id,
          ...commercialInfo,
        });
      }

      // Criar informações de estoque
      if (stockInfo) {
        await db.insert(productStockInfo).values({
          productId: newProduct.id,
          ...stockInfo,
          controlaLote: stockInfo.controlaLote ? 1 : 0,
          controlaValidade: stockInfo.controlaValidade ? 1 : 0,
        });
      }

      return newProduct;
    }),

  /**
   * Atualizar produto completo
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      // Informações básicas
      name: z.string().optional(),
      brand: z.string().optional(),
      description: z.string().optional(),
      price: z.number().int().optional(),
      unit: z.string().optional(),
      imageUrl: z.string().optional(),
      category: z.string().optional(),
      ean13: z.string().optional(),
      active: z.boolean().optional(),
      
      // Informações fiscais
      taxInfo: z.object({
        ncm: z.string().optional(),
        cest: z.string().optional(),
        origem: z.string().optional(),
        cstIcms: z.string().optional(),
        aliquotaIcms: z.number().optional(),
        cstPis: z.string().optional(),
        aliquotaPis: z.number().optional(),
        cstCofins: z.string().optional(),
        aliquotaCofins: z.number().optional(),
      }).optional(),
      
      // Informações comerciais
      commercialInfo: z.object({
        precoCusto: z.number().optional(),
        precoVenda: z.number().optional(),
        margemLucro: z.number().optional(),
        descontoMaximo: z.number().optional(),
      }).optional(),
      
      // Informações de estoque
      stockInfo: z.object({
        estoqueMinimo: z.number().optional(),
        estoqueMaximo: z.number().optional(),
        controlaLote: z.boolean().optional(),
        controlaValidade: z.boolean().optional(),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, taxInfo, commercialInfo, stockInfo, active, ...productData } = input;

      // Atualizar produto
      await db
        .update(products)
        .set({
          ...productData,
          active: active !== undefined ? (active ? 1 : 0) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id));

      // Atualizar informações fiscais
      if (taxInfo) {
        await db
          .update(productTaxInfo)
          .set({ ...taxInfo, updatedAt: new Date() })
          .where(eq(productTaxInfo.productId, id));
      }

      // Atualizar informações comerciais
      if (commercialInfo) {
        await db
          .update(productCommercialInfo)
          .set({ ...commercialInfo, updatedAt: new Date() })
          .where(eq(productCommercialInfo.productId, id));
      }

      // Atualizar informações de estoque
      if (stockInfo) {
        await db
          .update(productStockInfo)
          .set({
            ...stockInfo,
            controlaLote: stockInfo.controlaLote !== undefined ? (stockInfo.controlaLote ? 1 : 0) : undefined,
            controlaValidade: stockInfo.controlaValidade !== undefined ? (stockInfo.controlaValidade ? 1 : 0) : undefined,
            updatedAt: new Date(),
          })
          .where(eq(productStockInfo.productId, id));
      }

      return { success: true };
    }),

  /**
   * Deletar produto (soft delete)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(products)
        .set({ active: 0, updatedAt: new Date() })
        .where(eq(products.id, input.id));

      return { success: true };
    }),

  /**
   * Buscar produto por código de barras
   */
  getByBarcode: protectedProcedure
    .input(z.object({ barcode: z.string() }))
    .query(async ({ input }) => {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.ean13, input.barcode));

      return product || null;
    }),

  /**
   * Listar categorias únicas
   */
  listCategories: protectedProcedure
    .query(async () => {
      const categories = await db
        .selectDistinct({ category: products.category })
        .from(products)
        .where(and(eq(products.active, 1), sql`${products.category} IS NOT NULL`));

      return categories.map((c) => c.category).filter(Boolean);
    }),

  /**
   * Calcular preço de venda baseado em margem
   */
  calculatePrice: protectedProcedure
    .input(z.object({
      precoCusto: z.number(),
      margemLucro: z.number(), // em centésimos (ex: 3000 = 30%)
    }))
    .query(({ input }) => {
      const { precoCusto, margemLucro } = input;
      const precoVenda = Math.round(precoCusto * (1 + margemLucro / 10000));
      return { precoVenda };
    }),
});
