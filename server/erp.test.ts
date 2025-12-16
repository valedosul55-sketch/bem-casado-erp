import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: any[] } {
  const clearedCookies: any[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("ERP Bem Casado - Router Tests", () => {
  describe("auth.me", () => {
    it("returns user when authenticated", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.name).toBe("Test User");
      expect(result?.email).toBe("test@example.com");
    });

    it("returns null when not authenticated", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: { protocol: "https", headers: {} } as TrpcContext["req"],
        res: { clearCookie: () => {} } as TrpcContext["res"],
      };
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeNull();
    });
  });

  describe("auth.logout", () => {
    it("clears session cookie and returns success", async () => {
      const { ctx, clearedCookies } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
      expect(clearedCookies.length).toBe(1);
    });
  });

  describe("dashboard.getStats", () => {
    it("returns dashboard statistics", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.dashboard.getStats();

      expect(result).toBeDefined();
      expect(typeof result.vendasMes).toBe("number");
      expect(typeof result.clientesAtivos).toBe("number");
      expect(typeof result.produtosCadastrados).toBe("number");
      expect(typeof result.aReceber).toBe("number");
    });
  });

  describe("customers", () => {
    it("lists customers", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.customers.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("products", () => {
    it("lists products", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.products.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it("lists low stock products", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.products.lowStock();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("categories", () => {
    it("lists categories", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.categories.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("orders", () => {
    it("lists orders", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.orders.list({});

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("stock", () => {
    it("lists stock movements", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.stock.movements({});

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("financial", () => {
    it("lists financial accounts", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.financial.list({});

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("companies", () => {
    it("lists companies", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.companies.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
