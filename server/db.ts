import { eq, desc, sql, and, lte, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { 
  InsertUser, 
  users, 
  customers, 
  InsertCustomer,
  products,
  InsertProduct,
  categories,
  InsertCategory,
  orders,
  InsertOrder,
  orderItems,
  InsertOrderItem,
  stockMovements,
  InsertStockMovement,
  financialAccounts,
  InsertFinancialAccount,
  companies,
  InsertCompany,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USERS ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // PostgreSQL upsert using ON CONFLICT
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ CUSTOMERS ============
export async function getCustomers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customers).orderBy(desc(customers.createdAt));
}

export async function createCustomer(data: Omit<InsertCustomer, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(customers).values(data).returning();
  return { id: result[0]?.id ?? 0 };
}

export async function updateCustomer(data: { id: number } & Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { id, ...updateData } = data;
  await db.update(customers).set(updateData).where(eq(customers.id, id));
  return { success: true };
}

export async function deleteCustomer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(customers).where(eq(customers.id, id));
  return { success: true };
}

// ============ CATEGORIES ============
export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(categories).orderBy(categories.name);
}

export async function createCategory(data: Omit<InsertCategory, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(categories).values(data).returning();
  return { id: result[0]?.id ?? 0 };
}

// ============ PRODUCTS ============
export async function getProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getProductsLowStock() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products)
    .where(sql`${products.stockQuantity} <= ${products.minStock}`)
    .orderBy(products.stockQuantity);
}

export async function createProduct(data: Omit<InsertProduct, "id" | "createdAt" | "updatedAt" | "active">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(products).values({ ...data, active: true }).returning();
  return { id: result[0]?.id ?? 0 };
}

export async function updateProduct(data: { id: number } & Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { id, ...updateData } = data;
  await db.update(products).set(updateData).where(eq(products.id, id));
  return { success: true };
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(products).set({ active: false }).where(eq(products.id, id));
  return { success: true };
}

// ============ STOCK MOVEMENTS ============
export async function getStockMovements(productId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (productId) {
    return await db.select().from(stockMovements)
      .where(eq(stockMovements.productId, productId))
      .orderBy(desc(stockMovements.createdAt));
  }
  return await db.select().from(stockMovements).orderBy(desc(stockMovements.createdAt));
}

export async function createStockMovement(data: Omit<InsertStockMovement, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Insert movement
  const result = await db.insert(stockMovements).values(data).returning();
  
  // Update product stock
  const product = await db.select().from(products).where(eq(products.id, data.productId)).limit(1);
  if (product.length > 0) {
    const currentStock = product[0].stockQuantity || 0;
    const newStock = data.type === "entrada" 
      ? currentStock + data.quantity 
      : currentStock - data.quantity;
    
    await db.update(products)
      .set({ stockQuantity: Math.max(0, newStock) })
      .where(eq(products.id, data.productId));
  }
  
  return { id: result[0]?.id ?? 0 };
}

// ============ ORDERS ============
export async function getOrders(status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (status) {
    return await db.select().from(orders)
      .where(eq(orders.status, status as any))
      .orderBy(desc(orders.createdAt));
  }
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function createOrder(data: Omit<InsertOrder, "id" | "createdAt" | "updatedAt" | "orderNumber" | "subtotal" | "total" | "deliveryDate"> & { deliveryDate?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const orderNumber = `PED${nanoid(8).toUpperCase()}`;
  const result = await db.insert(orders).values({
    ...data,
    orderNumber,
    subtotal: "0",
    total: "0",
    deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
  }).returning();
  
  return { id: result[0]?.id ?? 0, orderNumber };
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
  return { success: true };
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function addOrderItem(data: Omit<InsertOrderItem, "id" | "total">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const total = (parseFloat(data.unitPrice) * data.quantity).toFixed(2);
  const result = await db.insert(orderItems).values({ ...data, total }).returning();
  
  // Update order totals
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, data.orderId));
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total), 0);
  
  const order = await db.select().from(orders).where(eq(orders.id, data.orderId)).limit(1);
  const discount = order.length > 0 ? parseFloat(order[0].discount || "0") : 0;
  const orderTotal = subtotal - discount;
  
  await db.update(orders)
    .set({ subtotal: subtotal.toFixed(2), total: orderTotal.toFixed(2) })
    .where(eq(orders.id, data.orderId));
  
  return { id: result[0]?.id ?? 0 };
}

// ============ FINANCIAL ============
export async function getFinancialAccounts(type?: "pagar" | "receber", status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(financialAccounts);
  
  if (type && status) {
    return await query
      .where(and(eq(financialAccounts.type, type), eq(financialAccounts.status, status as any)))
      .orderBy(desc(financialAccounts.dueDate));
  } else if (type) {
    return await query
      .where(eq(financialAccounts.type, type))
      .orderBy(desc(financialAccounts.dueDate));
  } else if (status) {
    return await query
      .where(eq(financialAccounts.status, status as any))
      .orderBy(desc(financialAccounts.dueDate));
  }
  
  return await query.orderBy(desc(financialAccounts.dueDate));
}

export async function createFinancialAccount(data: Omit<InsertFinancialAccount, "id" | "createdAt" | "updatedAt" | "status" | "paidDate" | "dueDate"> & { dueDate: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(financialAccounts).values({
    ...data,
    dueDate: new Date(data.dueDate),
    status: "pendente",
  }).returning();
  
  return { id: result[0]?.id ?? 0 };
}

export async function updateFinancialAccount(data: { id: number; status?: string; paidDate?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Record<string, any> = {};
  if (data.status) updateData.status = data.status;
  if (data.paidDate) updateData.paidDate = new Date(data.paidDate);
  
  await db.update(financialAccounts).set(updateData).where(eq(financialAccounts.id, data.id));
  return { success: true };
}

// ============ DASHBOARD STATS ============
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) {
    return {
      vendasMes: 0,
      clientesAtivos: 0,
      produtosCadastrados: 0,
      aReceber: 0,
    };
  }
  
  try {
    // Count customers
    const customersResult = await db.select({ count: sql<number>`count(*)` }).from(customers);
    const clientesAtivos = customersResult[0]?.count || 0;
    
    // Count products
    const productsResult = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.active, true));
    const produtosCadastrados = productsResult[0]?.count || 0;
    
    // Sum orders this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const ordersResult = await db.select({ total: sql<number>`COALESCE(SUM(total), 0)` })
      .from(orders)
      .where(gte(orders.createdAt, startOfMonth));
    const vendasMes = ordersResult[0]?.total || 0;
    
    // Sum pending receivables
    const receivablesResult = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(financialAccounts)
      .where(and(eq(financialAccounts.type, "receber"), eq(financialAccounts.status, "pendente")));
    const aReceber = receivablesResult[0]?.total || 0;
    
    return {
      vendasMes: Number(vendasMes),
      clientesAtivos: Number(clientesAtivos),
      produtosCadastrados: Number(produtosCadastrados),
      aReceber: Number(aReceber),
    };
  } catch (error) {
    console.error("[Dashboard] Error fetching stats:", error);
    return {
      vendasMes: 0,
      clientesAtivos: 0,
      produtosCadastrados: 0,
      aReceber: 0,
    };
  }
}


// ============ COMPANIES (Dados da Empresa) ============
export async function getCompanies() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(companies).orderBy(desc(companies.createdAt));
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createCompany(data: Omit<InsertCompany, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(companies).values(data).returning();
  return { id: result[0]?.id ?? 0 };
}

export async function updateCompany(id: number, data: Partial<Omit<InsertCompany, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(companies).set(data).where(eq(companies.id, id));
  return { success: true };
}

export async function deleteCompany(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(companies).where(eq(companies.id, id));
  return { success: true };
}


// ============ LOCAL AUTHENTICATION ============
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLocalUser(data: {
  username: string;
  password: string;
  name: string;
  empresa?: string;
  filial?: string;
  departamento?: string;
  role?: "user" | "admin";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if username already exists
  const existing = await getUserByUsername(data.username);
  if (existing) {
    throw new Error("Username already exists");
  }

  const passwordHash = await hashPassword(data.password);
  const openId = `local_${nanoid(16)}`; // Generate a unique openId for local users

  const result = await db.insert(users).values({
    openId,
    username: data.username,
    passwordHash,
    name: data.name,
    empresa: data.empresa || null,
    filial: data.filial || null,
    departamento: data.departamento || null,
    role: data.role || "user",
    loginMethod: "local",
    lastSignedIn: new Date(),
  }).returning();

  return { id: result[0]?.id ?? 0, openId };
}

export async function authenticateLocalUser(username: string, password: string) {
  const user = await getUserByUsername(username);
  
  if (!user || !user.passwordHash) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  // Update last signed in
  const db = await getDb();
  if (db) {
    await db.update(users)
      .set({ lastSignedIn: new Date() })
      .where(eq(users.id, user.id));
  }

  return user;
}

export async function ensureAdminUser() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot ensure admin user: database not available");
      return;
    }

    // Check if admin user exists
    const adminUser = await getUserByUsername("admin");
    if (!adminUser) {
      console.log("[Database] Creating default admin user...");
      await createLocalUser({
        username: "admin",
        password: "admin123", // Default password - should be changed after first login
        name: "Administrador",
        empresa: "BEM CASADO",
        filial: "MATRIZ",
        departamento: "TI",
        role: "admin",
      });
      console.log("[Database] Default admin user created successfully");
    } else {
      console.log("[Database] Admin user already exists");
    }
  } catch (error) {
    console.warn("[Database] Could not ensure admin user (will retry on next startup):", error);
  }
}
