import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("orders.create", () => {
  it("should create an order with valid data", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.create({
      customerName: "João Silva",
      customerEmail: "joao@exemplo.com",
      customerPhone: "(12) 99999-9999",
      items: [
        {
          productName: "Arroz Branco Tipo 1",
          productBrand: "Bem Casado",
          quantity: 2,
          unitPrice: 2300, // R$ 23.00 em centavos
        },
        {
          productName: "Feijão Carioca Tipo 1",
          productBrand: "Bem Casado",
          quantity: 1,
          unitPrice: 3990, // R$ 39.90 em centavos
        },
      ],
      paymentMethod: "credit_card",
      notes: "Pedido de teste",
    });

    expect(result).toHaveProperty("orderId");
    expect(result.orderId).toBeGreaterThan(0);
    expect(result.totalAmount).toBe(8590); // (23 * 2) + 39.90 = 85.90
  });

  it("should reject order with empty items", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.orders.create({
        customerName: "João Silva",
        customerPhone: "(12) 99999-9999",
        items: [],
        paymentMethod: "credit_card",
      })
    ).rejects.toThrow();
  });

  it("should reject order without customer name", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.orders.create({
        customerName: "",
        customerPhone: "(12) 99999-9999",
        items: [
          {
            productName: "Arroz Branco",
            quantity: 1,
            unitPrice: 2300,
          },
        ],
        paymentMethod: "credit_card",
      })
    ).rejects.toThrow();
  });
});

describe("orders.processPayment", () => {
  it("should process payment successfully in test mode", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Primeiro criar um pedido
    const order = await caller.orders.create({
      customerName: "Maria Santos",
      customerPhone: "(12) 98888-8888",
      items: [
        {
          productName: "Açúcar Cristal",
          productBrand: "Bem Casado",
          quantity: 1,
          unitPrice: 2900,
        },
      ],
      paymentMethod: "credit_card",
    });

    // Processar pagamento
    const paymentResult = await caller.orders.processPayment({
      orderId: order.orderId,
      paymentMethod: "credit_card",
      cardNumber: "4111111111111111",
      cardHolderName: "MARIA SANTOS",
      cardExpiryMonth: "12",
      cardExpiryYear: "2025",
      cardCvv: "123",
    });

    expect(paymentResult.success).toBe(true);
    expect(paymentResult.status).toBe("approved");
    expect(paymentResult.transactionId).toBeDefined();
    expect(paymentResult.transactionId).toContain("TEST_");
  });

  it("should reject payment for non-existent order", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.orders.processPayment({
        orderId: 999999,
        paymentMethod: "credit_card",
        cardNumber: "4111111111111111",
        cardHolderName: "TESTE",
        cardExpiryMonth: "12",
        cardExpiryYear: "2025",
        cardCvv: "123",
      })
    ).rejects.toThrow("Pedido não encontrado");
  });
});

describe("orders.getById", () => {
  it("should retrieve order with items", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Criar pedido
    const created = await caller.orders.create({
      customerName: "Pedro Oliveira",
      customerPhone: "(12) 97777-7777",
      items: [
        {
          productName: "Arroz Integral",
          quantity: 3,
          unitPrice: 2300,
        },
      ],
      paymentMethod: "pix",
    });

    // Buscar pedido
    const order = await caller.orders.getById({ orderId: created.orderId });

    expect(order).toBeDefined();
    expect(order.id).toBe(created.orderId);
    expect(order.customerName).toBe("Pedro Oliveira");
    expect(order.items).toHaveLength(1);
    expect(order.items[0].productName).toBe("Arroz Integral");
    expect(order.items[0].quantity).toBe(3);
  });

  it("should throw error for non-existent order", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.orders.getById({ orderId: 999999 })
    ).rejects.toThrow("Pedido não encontrado");
  });
});
