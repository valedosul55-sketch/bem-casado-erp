import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  getOrders,
  createOrder,
  updateOrderStatus,
  getOrderItems,
  addOrderItem,
  getStockMovements,
  createStockMovement,
  getFinancialAccounts,
  createFinancialAccount,
  updateFinancialAccount,
  getDashboardStats,
  getProductsLowStock,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Dashboard
  dashboard: router({
    getStats: protectedProcedure.query(async () => {
      return await getDashboardStats();
    }),
  }),

  // Clientes
  customers: router({
    list: protectedProcedure.query(async () => {
      return await getCustomers();
    }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          phone: z.string().optional(),
          email: z.string().email().optional().or(z.literal("")),
          cpfCnpj: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zipCode: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await createCustomer(input);
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1),
          phone: z.string().optional(),
          email: z.string().email().optional().or(z.literal("")),
          cpfCnpj: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zipCode: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await updateCustomer(input);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteCustomer(input.id);
      }),
  }),

  // Categorias
  categories: router({
    list: protectedProcedure.query(async () => {
      return await getCategories();
    }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await createCategory(input);
      }),
  }),

  // Produtos
  products: router({
    list: protectedProcedure.query(async () => {
      return await getProducts();
    }),
    lowStock: protectedProcedure.query(async () => {
      return await getProductsLowStock();
    }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          categoryId: z.number().optional(),
          price: z.string(),
          cost: z.string().optional(),
          stockQuantity: z.number().default(0),
          minStock: z.number().optional(),
          unit: z.string().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await createProduct(input);
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1),
          description: z.string().optional(),
          categoryId: z.number().optional(),
          price: z.string(),
          cost: z.string().optional(),
          stockQuantity: z.number(),
          minStock: z.number().optional(),
          unit: z.string().optional(),
          imageUrl: z.string().optional(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await updateProduct(input);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteProduct(input.id);
      }),
  }),

  // Estoque
  stock: router({
    movements: protectedProcedure
      .input(z.object({ productId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await getStockMovements(input?.productId);
      }),
    createMovement: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          type: z.enum(["entrada", "saida"]),
          quantity: z.number().min(1),
          reason: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createStockMovement({ ...input, userId: ctx.user?.id });
      }),
  }),

  // Pedidos
  orders: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return await getOrders(input?.status);
      }),
    getItems: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return await getOrderItems(input.orderId);
      }),
    create: protectedProcedure
      .input(
        z.object({
          customerId: z.number().optional(),
          status: z.enum(["orcamento", "confirmado", "producao", "pronto", "entregue", "cancelado"]).default("orcamento"),
          deliveryDate: z.string().optional(),
          deliveryAddress: z.string().optional(),
          notes: z.string().optional(),
          discount: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createOrder({ ...input, userId: ctx.user?.id });
      }),
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["orcamento", "confirmado", "producao", "pronto", "entregue", "cancelado"]),
        })
      )
      .mutation(async ({ input }) => {
        return await updateOrderStatus(input.id, input.status);
      }),
    addItem: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          productId: z.number(),
          quantity: z.number().min(1),
          unitPrice: z.string(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await addOrderItem(input);
      }),
  }),

  // Financeiro
  financial: router({
    list: protectedProcedure
      .input(
        z.object({
          type: z.enum(["pagar", "receber"]).optional(),
          status: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return await getFinancialAccounts(input?.type, input?.status);
      }),
    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["pagar", "receber"]),
          description: z.string().min(1),
          amount: z.string(),
          dueDate: z.string(),
          category: z.string().optional(),
          orderId: z.number().optional(),
          customerId: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createFinancialAccount({ ...input, userId: ctx.user?.id });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pendente", "pago", "vencido", "cancelado"]).optional(),
          paidDate: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await updateFinancialAccount(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
