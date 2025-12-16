import { pgTable, serial, text, varchar, timestamp, integer, decimal, boolean, pgEnum } from "drizzle-orm/pg-core";

// Enums para PostgreSQL
export const roleEnum = pgEnum("role", ["user", "admin", "gerente", "vendedor", "operador"]);
export const stockMovementTypeEnum = pgEnum("stock_movement_type", ["entrada", "saida"]);
export const orderStatusEnum = pgEnum("order_status", ["orcamento", "confirmado", "producao", "pronto", "entregue", "cancelado"]);
export const financialTypeEnum = pgEnum("financial_type", ["pagar", "receber"]);
export const financialStatusEnum = pgEnum("financial_status", ["pendente", "pago", "vencido", "cancelado"]);
export const financialCategoryTypeEnum = pgEnum("financial_category_type", ["receita", "despesa"]);

// Tabela de usuários (autenticação)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  passwordHash: text("passwordHash"),
  username: varchar("username", { length: 100 }).unique(),
  empresa: varchar("empresa", { length: 100 }),
  filial: varchar("filial", { length: 100 }),
  departamento: varchar("departamento", { length: 100 }),
  active: boolean("active").default(true).notNull(),
  resetToken: varchar("resetToken", { length: 255 }),
  resetTokenExpiry: timestamp("resetTokenExpiry"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela de clientes
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  cpfCnpj: varchar("cpfCnpj", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// Categorias de produtos
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// Tabela de produtos
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  categoryId: integer("categoryId"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  stockQuantity: integer("stockQuantity").default(0).notNull(),
  minStock: integer("minStock").default(0),
  unit: varchar("unit", { length: 20 }).default("un"),
  imageUrl: text("imageUrl"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Movimentações de estoque
export const stockMovements = pgTable("stockMovements", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  type: stockMovementTypeEnum("type").notNull(),
  quantity: integer("quantity").notNull(),
  reason: varchar("reason", { length: 255 }),
  notes: text("notes"),
  userId: integer("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = typeof stockMovements.$inferInsert;

// Pedidos/Vendas
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 20 }).notNull().unique(),
  customerId: integer("customerId"),
  status: orderStatusEnum("status").default("orcamento").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0").notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).default("0").notNull(),
  deliveryDate: timestamp("deliveryDate"),
  deliveryAddress: text("deliveryAddress"),
  notes: text("notes"),
  userId: integer("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Itens do pedido
export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Contas financeiras (a pagar e a receber)
export const financialAccounts = pgTable("financialAccounts", {
  id: serial("id").primaryKey(),
  type: financialTypeEnum("type").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("dueDate").notNull(),
  paidDate: timestamp("paidDate"),
  status: financialStatusEnum("status").default("pendente").notNull(),
  category: varchar("category", { length: 100 }),
  orderId: integer("orderId"),
  customerId: integer("customerId"),
  notes: text("notes"),
  userId: integer("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type FinancialAccount = typeof financialAccounts.$inferSelect;
export type InsertFinancialAccount = typeof financialAccounts.$inferInsert;

// Categorias financeiras
export const financialCategories = pgTable("financialCategories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: financialCategoryTypeEnum("type").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FinancialCategory = typeof financialCategories.$inferSelect;
export type InsertFinancialCategory = typeof financialCategories.$inferInsert;

// Dados da Empresa (Cadastros)
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  codigo: varchar("codigo", { length: 10 }),
  dig: varchar("dig", { length: 10 }),
  ccm: varchar("ccm", { length: 20 }),
  cnpj: varchar("cnpj", { length: 20 }),
  nome: varchar("nome", { length: 255 }).notNull(),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  cep: varchar("cep", { length: 15 }),
  inscricaoEstadual: varchar("inscricaoEstadual", { length: 20 }),
  versao: varchar("versao", { length: 20 }),
  numeroTerminais: integer("numeroTerminais"),
  usaDigHistorico: boolean("usaDigHistorico").default(false),
  usaDigCCustos: boolean("usaDigCCustos").default(false),
  usaDigConta: boolean("usaDigConta").default(false),
  codigoEmpresaCliente: varchar("codigoEmpresaCliente", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;
