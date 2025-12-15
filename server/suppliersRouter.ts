/**
 * Router de Fornecedores
 * 
 * Gerencia cadastro de fornecedores
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { suppliers, productSuppliers } from "../drizzle/schema";
import { eq, like, and, or, desc, asc, sql } from "drizzle-orm";

export const suppliersRouter = router({
  /**
   * Listar fornecedores
   */
  list: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(20),
      search: z.string().optional(),
      active: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      const { page, pageSize, search, active } = input;
      const offset = (page - 1) * pageSize;

      // Construir filtros
      const filters: any[] = [];
      if (search) {
        filters.push(
          or(
            like(suppliers.name, `%${search}%`),
            like(suppliers.cnpj, `%${search}%`),
            like(suppliers.contactName, `%${search}%`)
          )
        );
      }
      if (active !== undefined) {
        filters.push(eq(suppliers.active, active ? 1 : 0));
      }

      // Buscar fornecedores
      const suppliersList = await db
        .select()
        .from(suppliers)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(asc(suppliers.name))
        .limit(pageSize)
        .offset(offset);

      // Contar total
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(suppliers)
        .where(filters.length > 0 ? and(...filters) : undefined);

      return {
        suppliers: suppliersList,
        total: Number(count),
        page,
        pageSize,
        totalPages: Math.ceil(Number(count) / pageSize),
      };
    }),

  /**
   * Buscar fornecedor por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [supplier] = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, input.id));

      if (!supplier) {
        throw new Error("Fornecedor não encontrado");
      }

      // Buscar produtos deste fornecedor
      const products = await db
        .select({
          productId: productSuppliers.productId,
          codigoFornecedor: productSuppliers.codigoFornecedor,
          precoCusto: productSuppliers.precoCusto,
          isPrincipal: productSuppliers.isPrincipal,
        })
        .from(productSuppliers)
        .where(eq(productSuppliers.supplierId, input.id));

      return {
        ...supplier,
        products,
      };
    }),

  /**
   * Criar fornecedor
   */
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      tradeName: z.string().optional(),
      cnpj: z.string().optional(),
      cpf: z.string().optional(),
      ie: z.string().optional(),
      contactName: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      paymentTerms: z.string().optional(),
      deliveryTime: z.number().optional(),
      minOrderValue: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const [newSupplier] = await db
        .insert(suppliers)
        .values(input)
        .returning();

      return newSupplier;
    }),

  /**
   * Atualizar fornecedor
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      tradeName: z.string().optional(),
      cnpj: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      active: z.boolean().optional(),
      rating: z.number().optional(),
      isCertified: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, active, isCertified, ...data } = input;

      await db
        .update(suppliers)
        .set({
          ...data,
          active: active !== undefined ? (active ? 1 : 0) : undefined,
          isCertified: isCertified !== undefined ? (isCertified ? 1 : 0) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(suppliers.id, id));

      return { success: true };
    }),

  /**
   * Deletar fornecedor (soft delete)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(suppliers)
        .set({ active: 0, updatedAt: new Date() })
        .where(eq(suppliers.id, input.id));

      return { success: true };
    }),

  /**
   * Listar fornecedores ativos (para selects)
   */
  listActive: protectedProcedure
    .query(async () => {
      return await db
        .select({
          id: suppliers.id,
          name: suppliers.name,
          cnpj: suppliers.cnpj,
        })
        .from(suppliers)
        .where(eq(suppliers.active, 1))
        .orderBy(asc(suppliers.name));
    }),

  /**
   * Vincular fornecedor a produto
   */
  linkToProduct: protectedProcedure
    .input(z.object({
      productId: z.number(),
      supplierId: z.number(),
      codigoFornecedor: z.string().optional(),
      precoCusto: z.number().optional(),
      prazoEntrega: z.number().optional(),
      loteMinimoCompra: z.number().optional(),
      isPrincipal: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const { isPrincipal, ...data } = input;

      const [link] = await db
        .insert(productSuppliers)
        .values({
          ...data,
          isPrincipal: isPrincipal ? 1 : 0,
        })
        .returning();

      return link;
    }),

  /**
   * Desvincular fornecedor de produto
   */
  unlinkFromProduct: protectedProcedure
    .input(z.object({
      productId: z.number(),
      supplierId: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db
        .delete(productSuppliers)
        .where(
          and(
            eq(productSuppliers.productId, input.productId),
            eq(productSuppliers.supplierId, input.supplierId)
          )
        );

      return { success: true };
    }),
});
