import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InsertUser, users, orders, orderItems, products, InsertOrder, InsertOrderItem, Order, Product, InsertProduct } from "../drizzle/schema";
import { ENV } from './_core/env';

// Create a singleton connection pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// Export the db instance directly
export const db = drizzle(pool);

// Keep getDb for backward compatibility if needed, but it's better to use 'db' directly
export async function getDb() {
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
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
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Funções de pedidos
export async function createOrder(order: InsertOrder, items: Omit<InsertOrderItem, 'orderId'>[]) {
  try {
    // Inserir pedido
    const [insertedOrder] = await db.insert(orders).values(order).returning({ id: orders.id });
    const orderId = insertedOrder.id;

    // Inserir itens do pedido
    const itemsWithOrderId = items.map(item => ({
      ...item,
      orderId: orderId,
    }));

    await db.insert(orderItems).values(itemsWithOrderId);

    return orderId;
  } catch (error) {
    console.error("[Database] Failed to create order:", error);
    throw error;
  }
}

export async function getOrderById(orderId: number) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return null;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

  return {
    ...order,
    items,
  };
}

export async function updateOrderPaymentStatus(
  orderId: number,
  status: Order["paymentStatus"],
  transactionId?: string
) {
  const updateData: Partial<Order> = {
    paymentStatus: status,
    updatedAt: new Date(),
  };

  if (transactionId) {
    updateData.transactionId = transactionId;
  }

  await db.update(orders).set(updateData).where(eq(orders.id, orderId));
}

export async function getUserOrders(userId: number) {
  return await db.select().from(orders).where(eq(orders.userId, userId));
}

// Funções de produtos
export async function getAllProducts() {
  return await db.select().from(products).orderBy(products.name);
}

export async function getActiveProducts() {
  return await db.select().from(products).where(eq(products.active, 1)).orderBy(products.name);
}

export async function getProductById(id: number) {
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductByName(name: string) {
  const result = await db.select().from(products).where(eq(products.name, name)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(product: InsertProduct) {
  const result = await db.insert(products).values(product).returning({ id: products.id });
  return result[0].id;
}

export async function updateProduct(id: number, product: Partial<InsertProduct>) {
  await db.update(products).set({
    ...product,
    updatedAt: new Date(),
  }).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  await db.delete(products).where(eq(products.id, id));
}
